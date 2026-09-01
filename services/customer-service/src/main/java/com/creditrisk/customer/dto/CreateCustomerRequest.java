package com.creditrisk.customer.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateCustomerRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "SSN is required")
    private String ssn;

    // Employment
    private String employerName;
    private String jobTitle;
    private Integer employmentYears;
    private String employmentStatus;
    private BigDecimal annualIncome;

    // Financial
    private Integer creditScore;
    private BigDecimal existingDebt;
    private BigDecimal creditUtilization;
    private BigDecimal paymentHistoryScore;
    private Integer recentInquiries;
}
