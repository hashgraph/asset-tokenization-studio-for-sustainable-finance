#!/bin/bash
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
