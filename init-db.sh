#!/bin/bash
# init-db.sh
# PostgreSQL container ishga tushganda avtomatik ishga tushadi

set -e

echo "🔧 PostgreSQL database initialization..."

# Database yaratish (agar yo'q bo'lsa)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Extension o'rnatish
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Database settings
    ALTER DATABASE $POSTGRES_DB SET timezone TO 'UTC';
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    
    -- Info
    SELECT 'Database initialized successfully!' AS status;
EOSQL

echo "✅ PostgreSQL tayyor!"
