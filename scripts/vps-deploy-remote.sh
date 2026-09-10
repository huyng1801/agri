#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

APP_DIR="${APP_DIR:-/opt/agri-passport}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERROR: $APP_DIR not found on VPS"
  exit 1
fi

cd "$APP_DIR"

echo "=== Git fetch and hard reset to origin/master ==="
git fetch origin
git reset --hard origin/master
git clean -fd

echo "=== Current Commit on VPS ==="
git rev-parse HEAD
git log -1 --oneline

echo "=== Rebuild and start containers cleanly ==="
docker compose -f docker-compose.prod.yml --env-file .env.production build backend frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate frontend backend

echo "=== Reload Nginx ==="
docker exec agri_nginx nginx -s reload

echo "=== Run migrations & seed ==="
docker exec agri_backend npx prisma migrate deploy
docker exec agri_backend npm run seed:prod
docker exec agri_backend npm run seed:demo:prod

echo "=== Run smoke tests ==="
BASE_URL="${BASE_URL:-http://localhost}" bash scripts/smoke.sh

echo "=== Deploy complete ==="
docker compose -f docker-compose.prod.yml --env-file .env.production ps
