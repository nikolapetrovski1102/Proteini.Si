#!/usr/bin/env bash
# Build and ship the API and website to the Hetzner server.
#
#   deploy/deploy.sh stage        # stage.proteini.mk (API proxied at /api)
#   deploy/deploy.sh prod         # proteini.mk (API proxied at /api, like the old site)
#   deploy/deploy.sh stage api    # only the API (or: web, reports)
#   deploy/deploy.sh prod meta-ads   # only the Meta ads dashboard (meta-ads.proteini.mk, prod only;
#                                    # "prod all" ships it too). Its API lives in the prod API.
#
# "reports" is the daily report job (ProteiniSi.Reports). On prod it is run every
# morning by proteinisi-daily-report.timer; on stage it is only run by hand:
#   ssh proteinisi systemd-run --wait --pipe -p EnvironmentFile=/etc/proteinisi/stage.env \
#     -p EnvironmentFile=-/etc/proteinisi/reports.env -p WorkingDirectory=/srv/proteinisi/stage/reports \
#     dotnet ProteiniSi.Reports.dll --dry-run /tmp/report
# The same job sends the automatic marketing emails ("ProteiniSi.Reports.dll marketing"),
# every 15 minutes via proteinisi-marketing.timer, also enabled on prod only.
#
# Server secrets (appsettings.Production.json, /etc/proteinisi/*.env) stay on the
# server and are never overwritten. User uploads in wwwroot and App_Data (the
# auto-refreshed Instagram token) are never deleted.
set -euo pipefail

ENVIRONMENT="${1:-}"
PART="${2:-all}"
HOST="${DEPLOY_HOST:-proteinisi}"

case "$ENVIRONMENT" in
  prod)  SITE=https://proteini.mk;       API=https://proteini.mk;           SERVICE=proteinisi-api-prod;  PORT=6800 ;;
  stage) SITE=https://stage.proteini.mk; API=https://stage.proteini.mk; SERVICE=proteinisi-api-stage; PORT=6801 ;;
  *) echo "usage: $0 prod|stage [all|api|web|reports|meta-ads]" >&2; exit 1 ;;
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
  rsync -az --delete --exclude wwwroot/ --exclude logs/ --exclude App_Data/ --exclude appsettings.Production.json \
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
  # nginx's open_file_cache (proteinisi-common.conf) keeps the old index.html open for up to
  # 120s per worker, pointing at bundles rsync just deleted. A reload drops that cache at once.
  ssh "$HOST" "chown -R proteinisi:proteinisi $REMOTE/web && nginx -t -q && systemctl reload nginx"
fi

if [[ "$PART" == meta-ads && "$ENVIRONMENT" != prod ]]; then
  echo "The Meta ads dashboard only runs against production: $0 prod meta-ads" >&2; exit 1
fi

if [[ "$ENVIRONMENT" == prod && ( "$PART" == all || "$PART" == meta-ads ) ]]; then
  echo "==> Building Meta ads dashboard"
  cd "$ROOT/frontend"
  [[ -d node_modules ]] || npm ci
  npx vite build --config vite.meta-ads.config.js --outDir "$OUT/meta-ads" --emptyOutDir --logLevel warn

  echo "==> Uploading Meta ads dashboard to $HOST:/srv/proteinisi/meta-ads/web"
  ssh "$HOST" "mkdir -p /srv/proteinisi/meta-ads/web"
  rsync -az --delete "$OUT/meta-ads/" "$HOST:/srv/proteinisi/meta-ads/web/"
  ssh "$HOST" "chown -R proteinisi:proteinisi /srv/proteinisi/meta-ads && nginx -t -q && systemctl reload nginx"
fi

if [[ "$PART" == all || "$PART" == reports ]]; then
  echo "==> Publishing daily report job"
  dotnet publish "$ROOT/backend/Presentation/ProteiniSi.Reports/ProteiniSi.Reports.csproj" \
    -c Release -r linux-x64 --self-contained false -o "$OUT/reports" --nologo -v q

  echo "==> Uploading daily report job to $HOST:$REMOTE/reports"
  ssh "$HOST" "mkdir -p $REMOTE/reports"
  rsync -az --delete "$OUT/reports/" "$HOST:$REMOTE/reports/"
  rsync -az "$ROOT/deploy/systemd/proteinisi-daily-report@.service" "$ROOT/deploy/systemd/proteinisi-daily-report.timer" \
    "$ROOT/deploy/systemd/proteinisi-marketing@.service" "$ROOT/deploy/systemd/proteinisi-marketing.timer" \
    "$HOST:/etc/systemd/system/"
  ssh "$HOST" "systemctl daemon-reload"
  if [[ "$ENVIRONMENT" == prod ]]; then
    ssh "$HOST" "systemctl enable --now proteinisi-daily-report.timer proteinisi-marketing.timer"
  fi
  [[ "$PART" == reports ]] && { echo "Daily report and marketing email job deployed."; exit 0; }
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
