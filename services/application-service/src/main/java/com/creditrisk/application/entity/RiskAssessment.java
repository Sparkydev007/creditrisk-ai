package com.creditrisk.application.entity;

import com.creditrisk.constants.RiskCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Column(precision = 5, scale = 4)
    private BigDecimal probabilityOfDefault;

    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    private RiskCategory riskCategory;

    @Column(columnDefinition = "TEXT")
    private String riskFactorsJson;

    @Column(columnDefinition = "TEXT")
    private String explanationJson;

    private String modelVersion;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
