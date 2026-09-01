package com.creditrisk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictionRequest {
    private Long applicationId;
    private Double income;
    private Double loanAmount;
    private Integer employmentYears;
    private Double creditUtilization;
    private Double paymentHistoryScore;
    private Double existingDebt;
    private Integer recentInquiries;
}
