package com.creditrisk.decision.entity;

import com.creditrisk.constants.DecisionOutcome;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "decision_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private Long riskAssessmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DecisionOutcome outcome;

    @Column(precision = 5, scale = 4)
    private BigDecimal probabilityOfDefault;

    private BigDecimal debtToIncomeRatio;
    private BigDecimal loanToIncomeRatio;
    private BigDecimal riskScore;

    @Column(columnDefinition = "TEXT")
    private String explanationJson;

    @Column(columnDefinition = "TEXT")
    private String riskFactorsJson;

    @Column(columnDefinition = "TEXT")
    private String policyApplied;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
