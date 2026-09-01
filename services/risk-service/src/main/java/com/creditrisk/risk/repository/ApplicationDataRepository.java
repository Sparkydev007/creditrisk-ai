package com.creditrisk.risk.repository;

import com.creditrisk.risk.entity.ApplicationData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationDataRepository extends JpaRepository<ApplicationData, Long> {
    Optional<ApplicationData> findByApplicationId(Long applicationId);
}
