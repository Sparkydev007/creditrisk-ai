-- CreditRisk AI - Risk Service Schema

CREATE TABLE IF NOT EXISTS risk_assessment_data (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    loan_amount NUMERIC(15, 2) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    monthly_income NUMERIC(15, 2) NOT NULL,
    existing_debt NUMERIC(15, 2) NOT NULL,
    credit_score INTEGER NOT NULL,
    credit_utilization NUMERIC(5, 4),
    payment_history_score NUMERIC(5, 4),
    recent_inquiries INTEGER,
    employment_years INTEGER,
    has_bankruptcy BOOLEAN DEFAULT FALSE,
    has_delinquencies BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_data_application ON risk_assessment_data(application_id);
CREATE INDEX idx_risk_data_status ON risk_assessment_data(status);

CREATE TABLE IF NOT EXISTS risk_assessment_records (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    probability_of_default NUMERIC(5, 4) NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    risk_factors_json TEXT,
    explanation_json TEXT,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_records_application ON risk_assessment_records(application_id);
