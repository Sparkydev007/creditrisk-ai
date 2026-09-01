package com.creditrisk.risk.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "risk_assessment_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private BigDecimal probabilityOfDefault;

    private Integer riskScore;

    @Column(nullable = false)
    private String riskCategory;

    @Column(columnDefinition = "TEXT")
    private String riskFactorsJson;

    @Column(columnDefinition = "TEXT")
    private String explanationJson;

    private String modelVersion;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
