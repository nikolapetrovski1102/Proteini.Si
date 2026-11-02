#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <base-url> <admin-jwt-token> <order-id> [recipient-email] [payment-confirmed] [send-seller-notification]"
  echo "Example COD resend to order customer: $0 https://api.proteini.mk eyJhbGciOi... 1234"
  echo "Example COD resend to test email: $0 https://api.proteini.mk eyJhbGciOi... 1234 you@example.com false false"
  echo "Example card-style email: $0 https://api.proteini.mk eyJhbGciOi... 1234 you@example.com true false"
  exit 1
fi

BASE_URL="${1%/}"
TOKEN="$2"
ORDER_ID="$3"
EMAIL="${4:-}"
PAYMENT_CONFIRMED="${5:-false}"
SEND_SELLER_NOTIFICATION="${6:-false}"

URL="${BASE_URL}/api/Order/admin/debug/send-order-confirmation/${ORDER_ID}?paymentConfirmed=${PAYMENT_CONFIRMED}&sendSellerNotification=${SEND_SELLER_NOTIFICATION}"

if [ -n "$EMAIL" ]; then
  URL="${URL}&email=${EMAIL}"
fi

curl -i -sS -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  "$URL"

