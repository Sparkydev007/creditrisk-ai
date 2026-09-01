package com.creditrisk.decision.service;

import com.creditrisk.common.messaging.DomainEvent;
import com.creditrisk.common.messaging.EventPublisher;
import com.creditrisk.constants.DecisionOutcome;
import com.creditrisk.decision.entity.DecisionPolicy;
import com.creditrisk.decision.entity.DecisionRecord;
import com.creditrisk.decision.repository.DecisionPolicyRepository;
import com.creditrisk.decision.repository.DecisionRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DecisionEngineService {

    private final DecisionPolicyRepository policyRepository;
    private final DecisionRecordRepository decisionRepository;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${spring.kafka.topics.risk-events:risk-events}")
    private String riskEventsTopic;

    @Value("${spring.kafka.topics.decision-events:decision-events}")
    private String decisionEventsTopic;

    @KafkaListener(topics = "${spring.kafka.topics.risk-events:risk-events}",
                   groupId = "decision-service")
    public void handleRiskEvent(String message) {
        try {
            DomainEvent event = objectMapper.readValue(message, DomainEvent.class);
            log.info("Received event: {} for aggregate: {}", event.getEventType(), event.getAggregateId());

            if ("RiskAssessmentCompleted".equals(event.getEventType())) {
                Map<String, Object> payload = objectMapper.readValue(event.getPayload(), Map.class);
                Long applicationId = ((Number) payload.get("applicationId")).longValue();
                int riskScore = ((Number) payload.get("riskScore")).intValue();
                String riskCategory = (String) payload.get("riskCategory");
                BigDecimal pod = new BigDecimal(payload.get("probabilityOfDefault").toString());

                processDecision(applicationId, riskScore, riskCategory, pod, null, null);
            }
        } catch (Exception e) {
            log.error("Error processing risk event: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public DecisionRecord processDecision(Long applicationId, int riskScore, String riskCategory,
                                           BigDecimal probabilityOfDefault, BigDecimal debtToIncomeRatio,
                                           BigDecimal loanToIncomeRatio) {
        log.info("Processing decision for application: {}", applicationId);

        // Check if decision already exists
        Optional<DecisionRecord> existing = decisionRepository.findByApplicationId(applicationId);
        if (existing.isPresent()) {
            log.info("Decision already exists for application: {}", applicationId);
            return existing.get();
        }

        // Load active policy
        DecisionPolicy policy = policyRepository.findByPolicyNameAndEnabledTrue("default_policy")
                .orElse(null);

        // Parse policy config
        int minCreditScore = 650;
        double maxDti = 0.43;
        double approveThreshold = 0.05;
        double reviewThreshold = 0.15;
        double maxLti = 5.0;

        if (policy != null) {
            try {
                JsonNode config = objectMapper.readTree(policy.getPolicyConfig());
                minCreditScore = config.path("minCreditScore").asInt(650);
                maxDti = config.path("maxDti").asDouble(0.43);
                approveThreshold = config.path("approveProbabilityThreshold").asDouble(0.05);
                reviewThreshold = config.path("manualReviewProbabilityThreshold").asDouble(0.15);
                maxLti = config.path("maxLoanToIncomeRatio").asDouble(5.0);
            } catch (Exception e) {
                log.warn("Failed to parse policy config, using defaults: {}", e.getMessage());
            }
        }

        // Apply decision rules
        DecisionOutcome outcome;
        double pod = probabilityOfDefault.doubleValue();
        double dti = debtToIncomeRatio != null ? debtToIncomeRatio.doubleValue() : 0.3;
        double lti = loanToIncomeRatio != null ? loanToIncomeRatio.doubleValue() : 2.0;

        if (pod < approveThreshold && riskScore >= minCreditScore && dti <= maxDti && lti <= maxLti) {
            outcome = DecisionOutcome.APPROVE;
        } else if (pod > reviewThreshold || riskScore < minCreditScore || dti > maxDti) {
            outcome = DecisionOutcome.REJECT;
        } else {
            outcome = DecisionOutcome.MANUAL_REVIEW;
        }

        // Generate explanation
        String explanation = generateExplanation(outcome, pod, riskScore, dti, lti, minCreditScore, maxDti);

        // Save decision
        DecisionRecord record = DecisionRecord.builder()
                .applicationId(applicationId)
                .riskAssessmentId(0L) // placeholder
                .outcome(outcome)
                .probabilityOfDefault(probabilityOfDefault)
                .debtToIncomeRatio(debtToIncomeRatio)
                .loanToIncomeRatio(loanToIncomeRatio)
                .riskScore(BigDecimal.valueOf(riskScore))
                .explanationJson(explanation)
                .policyApplied(policy != null ? policy.getPolicyConfig() : "default")
                .build();

        record = decisionRepository.save(record);

        // Publish decision event
        String eventType = switch (outcome) {
            case APPROVE -> "ApplicationApproved";
            case REJECT -> "ApplicationRejected";
            case MANUAL_REVIEW -> "ApplicationUnderReview";
        };

        DomainEvent event = DomainEvent.create(
                eventType,
                String.valueOf(applicationId),
                "Decision",
                objectMapper.writeValueAsString(Map.of(
                        "applicationId", applicationId,
                        "outcome", outcome.name(),
                        "riskScore", riskScore,
                        "probabilityOfDefault", probabilityOfDefault
                )),
                null
        );
        eventPublisher.publish(decisionEventsTopic, event);

        log.info("Decision generated for application {}: {}", applicationId, outcome);
        return record;
    }

    private String generateExplanation(DecisionOutcome outcome, double pod, int riskScore,
                                       double dti, double lti, int minCreditScore, double maxDti) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Decision: %s\n\n", outcome.name()));

        sb.append("Positive Factors:\n");
        if (riskScore >= minCreditScore) {
            sb.append("✓ Strong credit score\n");
        }
        if (dti <= 0.30) {
            sb.append("✓ Low debt-to-income ratio\n");
        }
        if (pod < 0.03) {
            sb.append("✓ Very low default probability\n");
        }
        if (lti <= 3.0) {
            sb.append("✓ Reasonable loan-to-income ratio\n");
        }

        sb.append("\nRisk Factors:\n");
        if (riskScore < minCreditScore) {
            sb.append(String.format("⚠ Credit score below threshold (%d < %d)\n", riskScore, minCreditScore));
        }
        if (dti > maxDti) {
            sb.append(String.format("⚠ High debt-to-income ratio (%.1f%% > %.1f%%)\n", dti * 100, maxDti * 100));
        }
        if (pod > 0.05) {
            sb.append(String.format("⚠ Elevated default probability (%.1f%%)\n", pod * 100));
        }
        if (lti > 5.0) {
            sb.append(String.format("⚠ High loan-to-income ratio (%.1fx)\n", lti));
        }

        sb.append(String.format("\nModel:\nDefault probability = %.1f%%\nRisk score = %d", pod * 100, riskScore));

        return sb.toString();
    }
}
