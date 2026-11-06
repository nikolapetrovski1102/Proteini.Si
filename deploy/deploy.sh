#!/usr/bin/env bash
# Build and ship the API and website to the Hetzner server.
#
#   deploy/deploy.sh stage        # stage.proteini.mk (API proxied at /api)
#   deploy/deploy.sh prod         # proteini.mk (API proxied at /api, like the old site)
#   deploy/deploy.sh stage api    # only the API (or: web)
#
# Server secrets (appsettings.Production.json, /etc/proteinisi/*.env) stay on the
# server and are never overwritten. User uploads in wwwroot are never deleted.
set -euo pipefail

ENVIRONMENT="${1:-}"
PART="${2:-all}"
HOST="${DEPLOY_HOST:-proteinisi}"

case "$ENVIRONMENT" in
  prod)  SITE=https://proteini.mk;       API=https://proteini.mk;           SERVICE=proteinisi-api-prod;  PORT=6800 ;;
  stage) SITE=https://stage.proteini.mk; API=https://stage.proteini.mk; SERVICE=proteinisi-api-stage; PORT=6801 ;;
  *) echo "usage: $0 prod|stage [all|api|web]" >&2; exit 1 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT
REMOTE="/srv/proteinisi/$ENVIRONMENT"

if [[ "$PART" == all || "$PART" == api ]]; then
  echo "==> Publishing API"
  dotnet publish "$ROOT/backend/Presentation/ProteiniSi.Api/ProteiniSi.Api.csproj" \
    -c Release -r linux-x64 --self-contained false -p:PublishReadyToRun=true -o "$OUT/api" --nologo -v q
  rm -rf "$OUT"/api/appsettings.Development*.json "$OUT"/api/appsettings.Production*.json "$OUT/api/logs"

  echo "==> Uploading API to $HOST:$REMOTE/api"
  rsync -az --delete --exclude wwwroot/ --exclude logs/ --exclude appsettings.Production.json \
    "$OUT/api/" "$HOST:$REMOTE/api/"
  rsync -az "$OUT/api/wwwroot/" "$HOST:$REMOTE/api/wwwroot/"
  ssh "$HOST" "chown -R proteinisi:proteinisi $REMOTE/api && systemctl restart $SERVICE"
fi

if [[ "$PART" == all || "$PART" == web ]]; then
  echo "==> Building website"
  cd "$ROOT/frontend"
  [[ -d node_modules ]] || npm ci
  VITE_API_BASE_URL="$API/api" VITE_IMAGE_BASE_URL="$API" \
    npx vite build --outDir "$OUT/web" --emptyOutDir --logLevel warn

  echo "==> Uploading website to $HOST:$REMOTE/web"
  rsync -az --delete "$OUT/web/" "$HOST:$REMOTE/web/"
  ssh "$HOST" "chown -R proteinisi:proteinisi $REMOTE/web"
fi

echo "==> Health check"
for _ in $(seq 1 20); do
  if ssh "$HOST" "curl -fsS -o /dev/null http://127.0.0.1:$PORT/"; then
    echo "API healthy. $SITE and $API are live."
    exit 0
  fi
  sleep 2
done
echo "API did not come up; check: ssh $HOST journalctl -u $SERVICE -n 100" >&2
exit 1
