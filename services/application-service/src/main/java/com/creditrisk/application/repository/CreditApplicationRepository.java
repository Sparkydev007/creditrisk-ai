package com.creditrisk.application.repository;

import com.creditrisk.application.entity.CreditApplication;
import com.creditrisk.constants.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CreditApplicationRepository extends JpaRepository<CreditApplication, Long> {

    Page<CreditApplication> findByCustomerId(Long customerId, Pageable pageable);

    Page<CreditApplication> findByStatus(ApplicationStatus status, Pageable pageable);

    @Query("SELECT a FROM CreditApplication a WHERE " +
           "(:search IS NULL OR CAST(a.id AS STRING) LIKE CONCAT('%',:search,'%') " +
           "OR CAST(a.customerId AS STRING) LIKE CONCAT('%',:search,'%') " +
           "OR LOWER(a.loanType) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<CreditApplication> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT a.status, COUNT(a) FROM CreditApplication a GROUP BY a.status")
    List<Object[]> getStatusCounts();

    @Query("SELECT AVG(a.loanAmount) FROM CreditApplication a WHERE a.status = 'APPROVED'")
    BigDecimal getAverageApprovedAmount();
}
