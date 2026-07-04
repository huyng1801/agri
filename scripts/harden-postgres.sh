#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agri-passport}"

cd "$APP_DIR"

docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
docker exec -i agri_postgres sh -s < scripts/init-db.sh

echo "PostgreSQL app role hardened."
