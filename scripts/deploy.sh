#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agri-passport}"

cd "$APP_DIR"

mkdir -p nginx/certs nginx/logs backups
if [[ ! -f nginx/certs/origin.pem || ! -f nginx/certs/origin.key ]]; then
  echo "Generate temporary self-signed origin certificate..."
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout nginx/certs/origin.key \
    -out nginx/certs/origin.pem \
    -subj "/CN=${DOMAIN:-agri-passport}"
fi

echo "Pull latest code..."
git pull --ff-only

echo "Build and restart containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo "Run migrations..."
docker exec agri_backend npx prisma migrate deploy

echo "Seed required records..."
docker exec agri_backend npm run seed:prod

echo "Health check..."
sleep 8
docker compose -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS http://localhost/health

echo "Deploy done."
