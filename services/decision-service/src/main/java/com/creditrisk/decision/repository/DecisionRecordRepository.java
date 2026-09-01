package com.creditrisk.decision.repository;

import com.creditrisk.decision.entity.DecisionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DecisionRecordRepository extends JpaRepository<DecisionRecord, Long> {
    Optional<DecisionRecord> findByApplicationId(Long applicationId);
}
