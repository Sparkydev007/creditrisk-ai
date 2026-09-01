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
public class EmploymentProfile {

    @Column(name = "employer_name")
    private String employerName;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "employment_years")
    private Integer employmentYears;

    @Column(name = "employment_status")
    private String employmentStatus; // EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, RETIRED

    @Column(name = "annual_income", precision = 15, scale = 2)
    private BigDecimal annualIncome;
}
