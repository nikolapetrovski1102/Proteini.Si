#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <base-url> <admin-jwt-token> <recipient-email>"
  echo "Example: $0 https://api.proteini.mk eyJhbGciOi... you@example.com"
  exit 1
fi

BASE_URL="${1%/}"
TOKEN="$2"
EMAIL="$3"

curl -i -sS -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  "${BASE_URL}/api/Order/admin/debug/send-smtp-sample?email=${EMAIL}"

