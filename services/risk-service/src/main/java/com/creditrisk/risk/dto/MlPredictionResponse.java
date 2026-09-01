package com.creditrisk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictionResponse {
    private Double probabilityOfDefault;
    private String modelVersion;
    private Double confidence;
}
