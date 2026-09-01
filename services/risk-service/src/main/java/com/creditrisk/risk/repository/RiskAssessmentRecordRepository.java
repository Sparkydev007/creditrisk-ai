package com.creditrisk.risk.repository;

import com.creditrisk.risk.entity.RiskAssessmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskAssessmentRecordRepository extends JpaRepository<RiskAssessmentRecord, Long> {
    Optional<RiskAssessmentRecord> findByApplicationId(Long applicationId);
}
