package com.creditrisk.customer.dto;

import com.creditrisk.constants.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private Role role = Role.CUSTOMER;

    // Customer fields
    private String firstName;
    private String lastName;
    private String phone;
    private LocalDate dateOfBirth;
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
