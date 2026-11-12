-- Idempotent. Run: docker exec -i ejam-kopa-db psql -U <user> -d postgres -v pw=<password> -f - < create-db.sql
SELECT format('CREATE ROLE synapse LOGIN PASSWORD %L', :'pw')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'synapse') \gexec
SELECT 'CREATE DATABASE synapse OWNER synapse ENCODING ''UTF8'' LC_COLLATE ''C'' LC_CTYPE ''C'' TEMPLATE template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'synapse') \gexec
