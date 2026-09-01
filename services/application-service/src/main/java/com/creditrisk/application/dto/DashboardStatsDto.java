package com.creditrisk.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalApplications;
    private long approvedCount;
    private long rejectedCount;
    private long manualReviewCount;
    private long pendingCount;
    private double approvalRate;
    private double rejectionRate;
    private double manualReviewRate;
    private BigDecimal averageRiskScore;
    private BigDecimal averageDefaultProbability;
    private Map<String, Long> statusCounts;
}
