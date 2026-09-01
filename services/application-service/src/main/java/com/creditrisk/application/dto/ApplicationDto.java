package com.creditrisk.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
public class ApplicationDto {
    private Long id;
    private Long customerId;
    private String status;
    private BigDecimal loanAmount;
    private String loanType;
    private Integer loanTermMonths;
    private BigDecimal interestRate;
    private String purpose;
    private BigDecimal monthlyIncome;
    private BigDecimal existingDebt;
    private Integer creditScore;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    // Related data
    private RiskAssessmentDto riskAssessment;
    private DecisionDto decision;
}
