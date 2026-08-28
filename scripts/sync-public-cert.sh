#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agri-passport}"
CERT_NAME="${CERT_NAME:-agripassport.com}"
LE_LIVE_DIR="/etc/letsencrypt/live/${CERT_NAME}"
TARGET_DIR="${APP_DIR}/nginx/certs"
TARGET_CERT="${TARGET_DIR}/public.pem"
TARGET_KEY="${TARGET_DIR}/public.key"

if [[ ! -f "${LE_LIVE_DIR}/fullchain.pem" || ! -f "${LE_LIVE_DIR}/privkey.pem" ]]; then
  echo "Missing Let's Encrypt files in ${LE_LIVE_DIR}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"
cp "${LE_LIVE_DIR}/fullchain.pem" "${TARGET_CERT}"
cp "${LE_LIVE_DIR}/privkey.pem" "${TARGET_KEY}"
chmod 644 "${TARGET_CERT}"
chmod 600 "${TARGET_KEY}"

cd "${APP_DIR}"
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T nginx nginx -t
docker compose -f docker-compose.prod.yml --env-file .env.production restart nginx
