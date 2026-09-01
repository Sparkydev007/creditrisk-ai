package com.creditrisk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskFeatures {
    private Long applicationId;
    private BigDecimal debtToIncomeRatio;
    private BigDecimal loanToIncomeRatio;
    private BigDecimal creditUtilization;
    private BigDecimal paymentHistoryScore;
    private Integer creditScore;
    private Integer employmentYears;
    private BigDecimal annualIncome;
    private BigDecimal monthlyIncome;
    private BigDecimal loanAmount;
    private BigDecimal existingDebt;
    private Integer recentInquiries;
    private boolean hasBankruptcy;
    private boolean hasDelinquencies;
}
