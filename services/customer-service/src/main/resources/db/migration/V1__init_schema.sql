-- CreditRisk AI - Customer Service Schema

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    ssn VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Employment profile
    employer_name VARCHAR(200),
    job_title VARCHAR(200),
    employment_years INTEGER,
    employment_status VARCHAR(50),
    annual_income NUMERIC(15, 2),

    -- Financial profile
    credit_score INTEGER,
    monthly_income NUMERIC(15, 2),
    existing_debt NUMERIC(15, 2),
    credit_utilization NUMERIC(5, 4),
    payment_history_score NUMERIC(5, 4),
    recent_inquiries INTEGER,
    has_bankruptcy BOOLEAN DEFAULT FALSE,

    version BIGINT DEFAULT 0
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_last_name ON customers(last_name);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    customer_id BIGINT REFERENCES customers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Seed data: admin user (password: admin123)
INSERT INTO users (email, password, full_name, role) VALUES
    ('admin@creditrisk.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Seed data: analyst user (password: analyst123)
INSERT INTO users (email, password, full_name, role) VALUES
    ('analyst@creditrisk.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Risk Analyst', 'ANALYST')
ON CONFLICT (email) DO NOTHING;
