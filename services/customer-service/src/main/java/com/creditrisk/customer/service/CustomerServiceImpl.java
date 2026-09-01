package com.creditrisk.customer.service;

import com.creditrisk.common.dto.PageResponse;
import com.creditrisk.common.exception.ResourceNotFoundException;
import com.creditrisk.customer.dto.CreateCustomerRequest;
import com.creditrisk.customer.dto.CustomerDto;
import com.creditrisk.customer.entity.Customer;
import com.creditrisk.customer.entity.EmploymentProfile;
import com.creditrisk.customer.entity.FinancialProfile;
import com.creditrisk.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> getCustomers(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Customer> customerPage = customerRepository.search(search, PageRequest.of(page, size, sort));

        return PageResponse.<CustomerDto>builder()
                .content(customerPage.getContent().stream().map(this::toDto).toList())
                .page(customerPage.getNumber())
                .size(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        return toDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Customer with email already exists");
        }

        Customer customer = Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .ssn(request.getSsn())
                .employmentProfile(EmploymentProfile.builder()
                        .employerName(request.getEmployerName())
                        .jobTitle(request.getJobTitle())
                        .employmentYears(request.getEmploymentYears())
                        .employmentStatus(request.getEmploymentStatus())
                        .annualIncome(request.getAnnualIncome())
                        .build())
                .financialProfile(FinancialProfile.builder()
                        .creditScore(request.getCreditScore())
                        .existingDebt(request.getExistingDebt())
                        .creditUtilization(request.getCreditUtilization())
                        .paymentHistoryScore(request.getPaymentHistoryScore())
                        .recentInquiries(request.getRecentInquiries())
                        .hasBankruptcy(false)
                        .build())
                .build();

        customer = customerRepository.save(customer);
        log.info("Customer created: {}", customer.getId());
        return toDto(customer);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CreateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());

        if (request.getEmployerName() != null) {
            customer.setEmploymentProfile(EmploymentProfile.builder()
                    .employerName(request.getEmployerName())
                    .jobTitle(request.getJobTitle())
                    .employmentYears(request.getEmploymentYears())
                    .employmentStatus(request.getEmploymentStatus())
                    .annualIncome(request.getAnnualIncome())
                    .build());
        }

        if (request.getCreditScore() != null) {
            customer.setFinancialProfile(FinancialProfile.builder()
                    .creditScore(request.getCreditScore())
                    .existingDebt(request.getExistingDebt())
                    .creditUtilization(request.getCreditUtilization())
                    .paymentHistoryScore(request.getPaymentHistoryScore())
                    .recentInquiries(request.getRecentInquiries())
                    .hasBankruptcy(customer.getFinancialProfile() != null &&
                            customer.getFinancialProfile().getHasBankruptcy() != null &&
                            customer.getFinancialProfile().getHasBankruptcy())
                    .build());
        }

        customer = customerRepository.save(customer);
        log.info("Customer updated: {}", customer.getId());
        return toDto(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setActive(false);
        customerRepository.save(customer);
        log.info("Customer deactivated: {}", id);
    }

    private CustomerDto toDto(Customer customer) {
        CustomerDto.CustomerDtoBuilder builder = CustomerDto.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .dateOfBirth(customer.getDateOfBirth())
                .createdAt(customer.getCreatedAt());

        if (customer.getEmploymentProfile() != null) {
            EmploymentProfile emp = customer.getEmploymentProfile();
            builder.employerName(emp.getEmployerName())
                    .jobTitle(emp.getJobTitle())
                    .employmentYears(emp.getEmploymentYears())
                    .employmentStatus(emp.getEmploymentStatus())
                    .annualIncome(emp.getAnnualIncome());
        }

        if (customer.getFinancialProfile() != null) {
            FinancialProfile fin = customer.getFinancialProfile();
            builder.creditScore(fin.getCreditScore())
                    .existingDebt(fin.getExistingDebt())
                    .creditUtilization(fin.getCreditUtilization())
                    .paymentHistoryScore(fin.getPaymentHistoryScore())
                    .recentInquiries(fin.getRecentInquiries())
                    .hasBankruptcy(fin.getHasBankruptcy());
        }

        return builder.build();
    }
}
