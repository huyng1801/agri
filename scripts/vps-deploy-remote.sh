#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agri-passport}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERROR: $APP_DIR not found on VPS"
  exit 1
fi

cd "$APP_DIR"

echo "=== Git status before pull ==="
git rev-parse --short HEAD
git status --short

echo "=== Pull latest code ==="
git pull --ff-only

echo "=== Run deploy.sh ==="
bash scripts/deploy.sh

echo "=== Run smoke tests ==="
BASE_URL="${BASE_URL:-http://localhost}" bash scripts/smoke.sh

echo "=== Deploy complete ==="
docker compose -f docker-compose.prod.yml --env-file .env.production ps
