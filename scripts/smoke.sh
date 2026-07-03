#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost}"

curl -fsS "$BASE_URL/health"
curl -fsSI "$BASE_URL"
curl -fsS "$BASE_URL/api/v1/health"

echo "Smoke test passed for $BASE_URL"
