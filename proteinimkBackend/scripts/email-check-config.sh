#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <base-url> <admin-jwt-token>"
  echo "Example: $0 https://api.proteini.mk eyJhbGciOi..."
  exit 1
fi

BASE_URL="${1%/}"
TOKEN="$2"

curl -i -sS \
  -H "Authorization: Bearer ${TOKEN}" \
  "${BASE_URL}/api/Order/admin/debug/email-config"

