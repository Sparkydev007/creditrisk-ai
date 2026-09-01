package com.creditrisk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResult {
    private Long applicationId;
    private BigDecimal probabilityOfDefault;
    private Integer riskScore;
    private String riskCategory;
    private List<RiskFactor> riskFactors;
    private String explanation;
    private String modelVersion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        private String factor;
        private String impact; // POSITIVE, NEGATIVE, NEUTRAL
        private String description;
        private BigDecimal value;
    }
}
