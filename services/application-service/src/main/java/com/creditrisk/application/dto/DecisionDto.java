package com.creditrisk.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
public class DecisionDto {
    private Long id;
    private Long applicationId;
    private Long riskAssessmentId;
    private String outcome;
    private BigDecimal probabilityOfDefault;
    private BigDecimal debtToIncomeRatio;
    private BigDecimal loanToIncomeRatio;
    private String explanationJson;
    private String riskFactorsJson;
    private Instant createdAt;
}
