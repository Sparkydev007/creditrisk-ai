package com.creditrisk.customer.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPrincipal {
    private String email;
    private Long userId;
    private Long customerId;
    private String role;
}
