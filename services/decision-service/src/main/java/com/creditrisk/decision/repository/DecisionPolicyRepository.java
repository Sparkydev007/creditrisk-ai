package com.creditrisk.decision.repository;

import com.creditrisk.decision.entity.DecisionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DecisionPolicyRepository extends JpaRepository<DecisionPolicy, Long> {
    Optional<DecisionPolicy> findByPolicyNameAndEnabledTrue(String policyName);
}
