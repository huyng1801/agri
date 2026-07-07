#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agri-passport}"
cd "$APP_DIR"

mkdir -p nginx/certs nginx/logs backups

echo "=== Start database services ==="
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres redis

echo "=== Harden PostgreSQL ==="
bash scripts/harden-postgres.sh

echo "=== Build and restart containers ==="
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo "=== Run migrations ==="
docker exec agri_backend npx prisma migrate deploy

echo "=== Seed required records ==="
docker exec agri_backend npm run seed:prod

echo "=== Seed demo marketplace data ==="
docker exec agri_backend npm run seed:demo:prod

echo "=== Health check ==="
sleep 12
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS http://localhost/health
curl -fsS http://localhost/api/v1/health

echo "=== Smoke tests ==="
BASE_URL=http://localhost bash scripts/smoke.sh

echo "=== DONE ==="
