#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <base-url> <admin-jwt-token> <order-id>"
  echo "Example: $0 https://api.proteini.mk eyJhbGciOi... 1234"
  exit 1
fi

BASE_URL="${1%/}"
TOKEN="$2"
ORDER_ID="$3"

curl -i -sS \
  -H "Authorization: Bearer ${TOKEN}" \
  "${BASE_URL}/api/Order/admin/debug/order-email-data/${ORDER_ID}"

