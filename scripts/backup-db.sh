#!/usr/bin/env sh
set -eu

BACKUP_DIR="/backups"
DATE="$(date +"%Y%m%d-%H%M%S")"
FILE="$BACKUP_DIR/agri-passport-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h postgres \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" | gzip > "$FILE"

find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete

echo "Backup created: $FILE"
