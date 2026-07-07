#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost}"

curl -fsS "$BASE_URL/health"
curl -fsSI "$BASE_URL"
curl -fsS "$BASE_URL/api/v1/health"

check_api_route() {
  local path="$1"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")"
  if [[ "$code" == "500" || "$code" == "502" || "$code" == "503" ]]; then
    echo "Smoke failed: $path returned HTTP $code"
    exit 1
  fi
  echo "OK $path -> HTTP $code"
}

# Billing, reports, settings routes should be reachable (401/403 without token is expected)
check_api_route "/api/v1/payments"
check_api_route "/api/v1/reports/overview"
check_api_route "/api/v1/settings"

# Public multi-HTX checkout endpoint should validate payload (400 without body is expected)
code="$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/orders/public" -H 'Content-Type: application/json' -d '{}')"
if [[ "$code" == "500" || "$code" == "502" || "$code" == "503" ]]; then
  echo "Smoke failed: POST /api/v1/orders/public returned HTTP $code"
  exit 1
fi
echo "OK POST /api/v1/orders/public -> HTTP $code"

echo "Smoke test passed for $BASE_URL"
