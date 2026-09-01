package com.creditrisk.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class CustomerDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private Instant createdAt;

    // Employment
    private String employerName;
    private String jobTitle;
    private Integer employmentYears;
    private String employmentStatus;
    private BigDecimal annualIncome;

    // Financial
    private Integer creditScore;
    private BigDecimal monthlyIncome;
    private BigDecimal existingDebt;
    private BigDecimal creditUtilization;
    private BigDecimal paymentHistoryScore;
    private Integer recentInquiries;
    private Boolean hasBankruptcy;
}
