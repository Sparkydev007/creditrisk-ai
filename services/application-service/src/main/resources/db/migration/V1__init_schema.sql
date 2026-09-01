-- CreditRisk AI - Application Service Schema

CREATE TABLE IF NOT EXISTS credit_applications (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    loan_amount NUMERIC(15, 2) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    interest_rate NUMERIC(5, 2),
    purpose VARCHAR(500) NOT NULL,
    monthly_income NUMERIC(15, 2) NOT NULL,
    existing_debt NUMERIC(15, 2) NOT NULL,
    credit_score INTEGER NOT NULL,
    notes TEXT,
    submitted_by_user_id BIGINT,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_customer ON credit_applications(customer_id);
CREATE INDEX idx_applications_status ON credit_applications(status);
CREATE INDEX idx_applications_created ON credit_applications(created_at DESC);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    probability_of_default NUMERIC(5, 4),
    risk_score INTEGER,
    risk_category VARCHAR(20),
    risk_factors_json TEXT,
    explanation_json TEXT,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_application ON risk_assessments(application_id);

CREATE TABLE IF NOT EXISTS decisions (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    risk_assessment_id BIGINT NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    probability_of_default NUMERIC(5, 4),
    debt_to_income_ratio NUMERIC(5, 4),
    loan_to_income_ratio NUMERIC(5, 4),
    explanation_json TEXT,
    risk_factors_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_decisions_application ON decisions(application_id);
CREATE INDEX idx_decisions_outcome ON decisions(outcome);

-- Decision rules (configurable policy)
CREATE TABLE IF NOT EXISTS decision_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default rules
INSERT INTO decision_rules (rule_name, rule_config, enabled) VALUES
    ('default_policy', '{
        "minCreditScore": 650,
        "maxDti": 0.43,
        "approveProbabilityThreshold": 0.05,
        "manualReviewProbabilityThreshold": 0.15,
        "maxLoanToIncomeRatio": 5.0
    }', true)
ON CONFLICT (rule_name) DO NOTHING;
