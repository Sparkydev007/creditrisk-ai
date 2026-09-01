#!/bin/bash
# Create all databases for CreditRisk AI services
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE creditrisk_app;
    CREATE DATABASE creditrisk_risk;
    CREATE DATABASE creditrisk_decision;
    CREATE DATABASE creditrisk_audit;
    GRANT ALL PRIVILEGES ON DATABASE creditrisk_app TO creditrisk;
    GRANT ALL PRIVILEGES ON DATABASE creditrisk_risk TO creditrisk;
    GRANT ALL PRIVILEGES ON DATABASE creditrisk_decision TO creditrisk;
    GRANT ALL PRIVILEGES ON DATABASE creditrisk_audit TO creditrisk;
EOSQL
