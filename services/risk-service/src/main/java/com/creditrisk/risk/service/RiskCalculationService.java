package com.creditrisk.risk.service;

import com.creditrisk.risk.dto.*;
import com.creditrisk.risk.entity.ApplicationData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskCalculationService {

    private final MlServiceClient mlServiceClient;

    public RiskAssessmentResult assessRisk(ApplicationData app) {
        log.info("Starting risk assessment for application: {}", app.getId());

        // Step 1: Calculate financial features
        RiskFeatures features = calculateFeatures(app);
        log.info("Features calculated: DTI={}, LTI={}, CreditUtil={}",
                features.getDebtToIncomeRatio(), features.getLoanToIncomeRatio(),
                features.getCreditUtilization());

        // Step 2: Get ML prediction
        MlPredictionRequest mlRequest = MlPredictionRequest.builder()
                .applicationId(app.getId())
                .income(app.getMonthlyIncome().doubleValue() * 12)
                .loanAmount(app.getLoanAmount().doubleValue())
                .employmentYears(features.getEmploymentYears())
                .creditUtilization(features.getCreditUtilization() != null ?
                        features.getCreditUtilization().doubleValue() : 0.5)
                .paymentHistoryScore(features.getPaymentHistoryScore() != null ?
                        features.getPaymentHistoryScore().doubleValue() : 0.5)
                .existingDebt(features.getExistingDebt().doubleValue())
                .recentInquiries(features.getRecentInquiries())
                .build();

        MlPredictionResponse mlResponse = mlServiceClient.predict(mlRequest);

        // Step 3: Calculate risk score (300-850 scale)
        int riskScore = calculateRiskScore(features, mlResponse.getProbabilityOfDefault());

        // Step 4: Determine risk category
        String riskCategory = categorizeRisk(mlResponse.getProbabilityOfDefault(), riskScore);

        // Step 5: Generate risk factors
        List<RiskAssessmentResult.RiskFactor> riskFactors = generateRiskFactors(features, mlResponse);

        // Step 6: Generate explanation
        String explanation = generateExplanation(riskCategory, mlResponse.getProbabilityOfDefault(),
                riskScore, riskFactors);

        return RiskAssessmentResult.builder()
                .applicationId(app.getId())
                .probabilityOfDefault(BigDecimal.valueOf(mlResponse.getProbabilityOfDefault())
                        .setScale(4, RoundingMode.HALF_UP))
                .riskScore(riskScore)
                .riskCategory(riskCategory)
                .riskFactors(riskFactors)
                .explanation(explanation)
                .modelVersion(mlResponse.getModelVersion())
                .build();
    }

    public RiskFeatures calculateFeatures(ApplicationData app) {
        BigDecimal dti = app.getMonthlyIncome().compareTo(BigDecimal.ZERO) > 0
                ? app.getExistingDebt().divide(app.getMonthlyIncome().multiply(BigDecimal.valueOf(12)),
                        4, RoundingMode.HALF_UP)
                : BigDecimal.ONE;

        BigDecimal lti = app.getLoanAmount().divide(
                app.getMonthlyIncome().multiply(BigDecimal.valueOf(12)),
                4, RoundingMode.HALF_UP);

        return RiskFeatures.builder()
                .applicationId(app.getId())
                .debtToIncomeRatio(dti)
                .loanToIncomeRatio(lti)
                .creditUtilization(app.getCreditUtilization())
                .paymentHistoryScore(app.getPaymentHistoryScore())
                .creditScore(app.getCreditScore())
                .employmentYears(app.getEmploymentYears())
                .annualIncome(app.getMonthlyIncome().multiply(BigDecimal.valueOf(12)))
                .monthlyIncome(app.getMonthlyIncome())
                .loanAmount(app.getLoanAmount())
                .existingDebt(app.getExistingDebt())
                .recentInquiries(app.getRecentInquiries() != null ? app.getRecentInquiries() : 0)
                .hasBankruptcy(app.getHasBankruptcy() != null && app.getHasBankruptcy())
                .hasDelinquencies(app.getHasDelinquencies() != null && app.getHasDelinquencies())
                .build();
    }

    private int calculateRiskScore(RiskFeatures features, double probabilityOfDefault) {
        // Start with credit score as base, adjust based on features
        int baseScore = features.getCreditScore() != null ? features.getCreditScore() : 650;

        // Adjust based on DTI
        double dti = features.getDebtToIncomeRatio().doubleValue();
        if (dti > 0.43) baseScore -= 50;
        else if (dti > 0.35) baseScore -= 25;
        else if (dti < 0.20) baseScore += 20;

        // Adjust based on LTI
        double lti = features.getLoanToIncomeRatio().doubleValue();
        if (lti > 5.0) baseScore -= 40;
        else if (lti > 3.0) baseScore -= 20;

        // Adjust based on ML prediction
        if (probabilityOfDefault > 0.15) baseScore -= 60;
        else if (probabilityOfDefault > 0.05) baseScore -= 30;
        else if (probabilityOfDefault < 0.02) baseScore += 30;

        // Adjust for employment
        if (features.getEmploymentYears() != null && features.getEmploymentYears() < 2) {
            baseScore -= 20;
        }

        // Adjust for credit utilization
        if (features.getCreditUtilization() != null) {
            double util = features.getCreditUtilization().doubleValue();
            if (util > 0.70) baseScore -= 30;
            else if (util > 0.50) baseScore -= 15;
            else if (util < 0.30) baseScore += 15;
        }

        // Adjust for recent inquiries
        if (features.getRecentInquiries() != null && features.getRecentInquiries() > 5) {
            baseScore -= 20;
        }

        return Math.max(300, Math.min(850, baseScore));
    }

    private String categorizeRisk(double probabilityOfDefault, int riskScore) {
        if (probabilityOfDefault < 0.05 && riskScore >= 700) return "LOW";
        if (probabilityOfDefault < 0.15 && riskScore >= 600) return "MEDIUM";
        return "HIGH";
    }

    private List<RiskAssessmentResult.RiskFactor> generateRiskFactors(
            RiskFeatures features, MlPredictionResponse mlResponse) {

        List<RiskAssessmentResult.RiskFactor> factors = new ArrayList<>();

        // DTI factor
        double dti = features.getDebtToIncomeRatio().doubleValue();
        factors.add(RiskAssessmentResult.RiskFactor.builder()
                .factor("debt_to_income_ratio")
                .impact(dti > 0.43 ? "NEGATIVE" : dti < 0.30 ? "POSITIVE" : "NEUTRAL")
                .description(String.format("DTI ratio: %.1f%%", dti * 100))
                .value(features.getDebtToIncomeRatio())
                .build());

        // Credit score factor
        if (features.getCreditScore() != null) {
            factors.add(RiskAssessmentResult.RiskFactor.builder()
                    .factor("credit_score")
                    .impact(features.getCreditScore() >= 700 ? "POSITIVE" :
                           features.getCreditScore() >= 650 ? "NEUTRAL" : "NEGATIVE")
                    .description(String.format("Credit score: %d", features.getCreditScore()))
                    .value(BigDecimal.valueOf(features.getCreditScore()))
                    .build());
        }

        // Credit utilization
        if (features.getCreditUtilization() != null) {
            double util = features.getCreditUtilization().doubleValue();
            factors.add(RiskAssessmentResult.RiskFactor.builder()
                    .factor("credit_utilization")
                    .impact(util <= 0.30 ? "POSITIVE" : util > 0.50 ? "NEGATIVE" : "NEUTRAL")
                    .description(String.format("Credit utilization: %.1f%%", util * 100))
                    .value(features.getCreditUtilization())
                    .build());
        }

        // Employment stability
        if (features.getEmploymentYears() != null) {
            factors.add(RiskAssessmentResult.RiskFactor.builder()
                    .factor("employment_stability")
                    .impact(features.getEmploymentYears() >= 5 ? "POSITIVE" :
                           features.getEmploymentYears() < 2 ? "NEGATIVE" : "NEUTRAL")
                    .description(String.format("Employment: %d years", features.getEmploymentYears()))
                    .value(BigDecimal.valueOf(features.getEmploymentYears()))
                    .build());
        }

        // Recent inquiries
        if (features.getRecentInquiries() != null && features.getRecentInquiries() > 3) {
            factors.add(RiskAssessmentResult.RiskFactor.builder()
                    .factor("recent_inquiries")
                    .impact("NEGATIVE")
                    .description(String.format("%d recent credit inquiries", features.getRecentInquiries()))
                    .value(BigDecimal.valueOf(features.getRecentInquiries()))
                    .build());
        }

        // ML prediction
        factors.add(RiskAssessmentResult.RiskFactor.builder()
                .factor("model_prediction")
                .impact(mlResponse.getProbabilityOfDefault() < 0.05 ? "POSITIVE" : "NEGATIVE")
                .description(String.format("Default probability: %.1f%%",
                        mlResponse.getProbabilityOfDefault() * 100))
                .value(BigDecimal.valueOf(mlResponse.getProbabilityOfDefault()))
                .build());

        return factors;
    }

    private String generateExplanation(String riskCategory, double pod, int riskScore,
                                       List<RiskAssessmentResult.RiskFactor> factors) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Risk Category: %s\n", riskCategory));
        sb.append(String.format("Risk Score: %d\n", riskScore));
        sb.append(String.format("Probability of Default: %.1f%%\n\n", pod * 100));

        sb.append("Positive Factors:\n");
        factors.stream()
                .filter(f -> "POSITIVE".equals(f.getImpact()))
                .forEach(f -> sb.append(String.format("✓ %s\n", f.getDescription())));

        sb.append("\nRisk Factors:\n");
        factors.stream()
                .filter(f -> "NEGATIVE".equals(f.getImpact()))
                .forEach(f -> sb.append(String.format("⚠ %s\n", f.getDescription())));

        return sb.toString();
    }
}
