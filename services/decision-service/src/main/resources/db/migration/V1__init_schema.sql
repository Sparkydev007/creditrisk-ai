-- CreditRisk AI - Decision Service Schema

CREATE TABLE IF NOT EXISTS decision_policies (
    id BIGSERIAL PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    policy_config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO decision_policies (policy_name, policy_config, enabled, created_by) VALUES
    ('default_policy', '{
        "minCreditScore": 650,
        "maxDti": 0.43,
        "approveProbabilityThreshold": 0.05,
        "manualReviewProbabilityThreshold": 0.15,
        "maxLoanToIncomeRatio": 5.0
    }', true, 'system')
ON CONFLICT (policy_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS decision_records (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    risk_assessment_id BIGINT NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    probability_of_default NUMERIC(5, 4),
    debt_to_income_ratio NUMERIC(5, 4),
    loan_to_income_ratio NUMERIC(5, 4),
    risk_score NUMERIC(5, 2),
    explanation_json TEXT,
    risk_factors_json TEXT,
    policy_applied TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_decisions_application ON decision_records(application_id);
CREATE INDEX idx_decisions_outcome ON decision_records(outcome);
