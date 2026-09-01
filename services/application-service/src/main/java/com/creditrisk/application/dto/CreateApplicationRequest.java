package com.creditrisk.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateApplicationRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1000", message = "Loan amount must be at least 1000")
    private BigDecimal loanAmount;

    @NotBlank(message = "Loan type is required")
    private String loanType;

    @NotNull(message = "Loan term is required")
    @Min(value = 6, message = "Loan term must be at least 6 months")
    private Integer loanTermMonths;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Monthly income is required")
    @DecimalMin(value = "0", message = "Monthly income must be positive")
    private BigDecimal monthlyIncome;

    @NotNull(message = "Existing debt is required")
    @DecimalMin(value = "0", message = "Existing debt must be positive")
    private BigDecimal existingDebt;

    @NotNull(message = "Credit score is required")
    @Min(value = 300, message = "Credit score must be at least 300")
    @Max(value = 850, message = "Credit score must be at most 850")
    private Integer creditScore;

    private String notes;
}
