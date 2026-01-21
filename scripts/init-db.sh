#!/bin/bash
# =============================================================================
# PostgreSQL Database Initialization Script
# =============================================================================
# This script is automatically executed by PostgreSQL on first container start
# (when the data volume is empty). It creates the required databases for each
# service in the Green Bonds Platform.
#
# Databases created:
#   - ats_db: ATS (Asset Tokenization Service)
#   - primary_market_db: Primary Market offerings and subscriptions
#   - treasury_db: Treasury and portfolio management
#
# Note: This script only runs once during initial setup. To recreate databases:
#   docker compose down -v && docker compose up -d
# =============================================================================
set -e

# Create databases for each API
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create ATS database
    CREATE DATABASE ats_db;
    
    -- Create Primary Market database
    CREATE DATABASE primary_market_db;
    
    -- Create Treasury database
    CREATE DATABASE treasury_db;
    
    -- Grant all privileges
    GRANT ALL PRIVILEGES ON DATABASE ats_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE primary_market_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE treasury_db TO postgres;
EOSQL

echo "✅ All databases created successfully"
