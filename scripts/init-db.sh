#!/usr/bin/env sh
set -eu

: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_APP_USER:?POSTGRES_APP_USER is required}"
: "${POSTGRES_APP_PASSWORD:?POSTGRES_APP_PASSWORD is required}"

case "$POSTGRES_USER" in
  ""|*[!A-Za-z0-9_]*)
    echo "POSTGRES_USER must contain only letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

case "$POSTGRES_APP_USER" in
  ""|*[!A-Za-z0-9_]*)
    echo "POSTGRES_APP_USER must contain only letters, numbers, and underscores." >&2
    exit 1
    ;;
esac

if ! psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select 1 from pg_roles where rolname = '$POSTGRES_APP_USER'" | grep -q 1; then
  createuser -U "$POSTGRES_USER" --no-superuser --no-createdb --no-createrole "$POSTGRES_APP_USER"
fi

psql -v ON_ERROR_STOP=1 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --set=admin_user="$POSTGRES_USER" \
  --set=app_user="$POSTGRES_APP_USER" \
  --set=app_password="$POSTGRES_APP_PASSWORD" \
  --set=db_name="$POSTGRES_DB" <<'SQL'
ALTER ROLE :"app_user" WITH
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  PASSWORD :'app_password';

ALTER DATABASE :"db_name" OWNER TO :"app_user";

\connect :"db_name"

ALTER SCHEMA public OWNER TO :"app_user";
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"db_name" TO :"app_user";
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
SQL

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
DO \$\$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I OWNER TO %I', item.schemaname, item.tablename, '$POSTGRES_APP_USER');
  END LOOP;

  FOR item IN
    SELECT schemaname, sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER SEQUENCE %I.%I OWNER TO %I', item.schemaname, item.sequencename, '$POSTGRES_APP_USER');
  END LOOP;

  FOR item IN
    SELECT n.nspname AS schemaname, t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typtype IN ('e', 'd')
      AND t.typname NOT LIKE '\\_%'
  LOOP
    EXECUTE format('ALTER TYPE %I.%I OWNER TO %I', item.schemaname, item.typname, '$POSTGRES_APP_USER');
  END LOOP;
END
\$\$;
SQL

psql -v ON_ERROR_STOP=1 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --set=app_user="$POSTGRES_APP_USER" <<'SQL'
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO :"app_user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"app_user" IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"app_user" IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"app_user" IN SCHEMA public GRANT USAGE ON TYPES TO :"app_user";
SQL
