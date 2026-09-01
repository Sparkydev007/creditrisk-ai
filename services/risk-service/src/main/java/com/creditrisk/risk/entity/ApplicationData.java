package com.creditrisk.risk.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "risk_assessment_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private BigDecimal loanAmount;

    @Column(nullable = false)
    private String loanType;

    @Column(nullable = false)
    private Integer loanTermMonths;

    @Column(nullable = false)
    private BigDecimal monthlyIncome;

    @Column(nullable = false)
    private BigDecimal existingDebt;

    @Column(nullable = false)
    private Integer creditScore;

    private BigDecimal creditUtilization;
    private BigDecimal paymentHistoryScore;
    private Integer recentInquiries;
    private Integer employmentYears;
    private Boolean hasBankruptcy;
    private Boolean hasDelinquencies;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, COMPLETED, FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
