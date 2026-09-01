package com.creditrisk.customer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialProfile {

    @Column(name = "credit_score")
    private Integer creditScore;

    @Column(name = "monthly_income", precision = 15, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "existing_debt", precision = 15, scale = 2)
    private BigDecimal existingDebt;

    @Column(name = "credit_utilization")
    private BigDecimal creditUtilization; // 0.0 - 1.0

    @Column(name = "payment_history_score")
    private BigDecimal paymentHistoryScore; // 0.0 - 1.0

    @Column(name = "recent_inquiries")
    private Integer recentInquiries;

    @Column(name = "has_bankruptcy")
    private Boolean hasBankruptcy = false;
}
