package com.creditrisk.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
public class RiskAssessmentDto {
    private Long id;
    private Long applicationId;
    private BigDecimal probabilityOfDefault;
    private Integer riskScore;
    private String riskCategory;
    private String riskFactorsJson;
    private String explanationJson;
    private String modelVersion;
    private Instant createdAt;
}
