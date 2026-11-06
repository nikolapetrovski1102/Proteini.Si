#!/usr/bin/env bash
# Production cutover: load the live data from the OLD production server into the new box.
#
#   deploy/cutover-prod.sh <old-prod.bak> <old-wwwroot-dir>
#
#   <old-prod.bak>      fresh full backup of the old production DB (proteinimkdb), taken
#                       AFTER the old site stopped taking orders.
#   <old-wwwroot-dir>   copy of the old API's wwwroot (uploaded product/variant/slider images).
#
# Steps (prod only; stage is not touched):
#   1. uploads the .bak plus the repo's migrations 0009/0010 and all procedures
#   2. stops proteinisi-api-prod and backs up the current prod DB (rollback point)
#   3. restores the old prod DB over proteinimkdb, so all old data is kept as is
#   4. re-maps the proteinisi_prod login (read/write + EXECUTE)
#   5. runs migrations 0009 + 0010 (idempotent, additive) and every stored procedure
#   6. copies the uploaded images into the prod wwwroot (adds/overwrites, never deletes)
#   7. starts the API and checks health
#
# Rollback: restore the printed pre-cutover backup the same way, or just point DNS back.
set -euo pipefail

BAK="${1:-}"; WWW="${2:-}"
HOST="${DEPLOY_HOST:-proteinisi}"
[[ -f "$BAK" && -d "$WWW" ]] || { echo "usage: $0 <old-prod.bak> <old-wwwroot-dir>" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TS="$(date +%Y%m%d%H%M%S)"
STAGING="/srv/mssql/backup/cutover-$TS"          # = /var/opt/mssql/backup/cutover-$TS in the container
UPLOAD_DIRS=(uploads partners home-slider product-images product-gallery variant-images variant-gallery)

echo "==> Uploading backup and SQL to $HOST:$STAGING"
ssh "$HOST" "mkdir -p $STAGING/sql/migrations"
rsync -az "$BAK" "$HOST:$STAGING/old-prod.bak"
rsync -az "$ROOT/database/migrations/0009_create-procedure-table-types.sql" \
          "$ROOT/database/migrations/0010_create-newsletter-subscribers.sql" "$HOST:$STAGING/sql/migrations/"
rsync -az "$ROOT/database/procedures" "$HOST:$STAGING/sql/"
ssh "$HOST" "chown -R 10001 $STAGING"

echo "==> Restoring on the server"
ssh "$HOST" bash -s -- "$TS" <<'REMOTE'
set -euo pipefail
TS="$1"
C="/var/opt/mssql/backup/cutover-$TS"
set -a; . /root/.proteinisi/secrets.env; set +a
sql() { docker exec -e SQLCMDPASSWORD="$SA_PASSWORD" mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -I "$@"; }

echo "Before: $(sql -h -1 -W -Q 'SET NOCOUNT ON; SELECT MAX(Order_Id) FROM proteinimkdb.dbo.Orders')  (max Order_Id)"

systemctl stop proteinisi-api-prod
# On any failure: leave the DB usable and the API running (on whatever data is there).
trap 'sql -Q "IF DB_ID(N'"'"'proteinimkdb'"'"') IS NOT NULL ALTER DATABASE proteinimkdb SET MULTI_USER" || true; systemctl start proteinisi-api-prod; echo "Cutover FAILED; API restarted. Rollback backup is listed above." >&2' ERR

PRE="/var/opt/mssql/backup/proteinimkdb-pre-cutover-$TS.bak"
sql -Q "BACKUP DATABASE proteinimkdb TO DISK = N'$PRE' WITH COPY_ONLY, INIT, CHECKSUM"
echo "Rollback backup: $PRE (host: /srv/mssql/backup/$(basename "$PRE"))"

# Map every file in the old backup onto this server's data paths.
MOVES=""; n=0
while IFS='|' read -r logical type; do
  logical="$(echo "$logical" | xargs)"; type="$(echo "$type" | xargs)"
  [[ -z "$logical" ]] && continue
  if [[ "$type" == L ]]; then target="/var/opt/mssql/data/proteinimkdb_log.ldf"
  elif (( n == 0 )); then target="/var/opt/mssql/data/proteinimkdb.mdf"; n=1
  else target="/var/opt/mssql/data/proteinimkdb_$n.ndf"; n=$((n+1)); fi
  MOVES+=", MOVE N'$logical' TO N'$target'"
done < <(sql -h -1 -W -s '|' -Q "SET NOCOUNT ON; RESTORE FILELISTONLY FROM DISK = N'$C/old-prod.bak'" | cut -d'|' -f1,3)
[[ -n "$MOVES" ]] || { echo "Could not read the backup file list" >&2; exit 1; }

sql -Q "ALTER DATABASE proteinimkdb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        RESTORE DATABASE proteinimkdb FROM DISK = N'$C/old-prod.bak' WITH REPLACE $MOVES;
        ALTER DATABASE proteinimkdb SET MULTI_USER;"

sql -d proteinimkdb -Q "
  IF USER_ID('proteinisi_prod') IS NULL CREATE USER proteinisi_prod FOR LOGIN proteinisi_prod;
  ELSE ALTER USER proteinisi_prod WITH LOGIN = proteinisi_prod;
  ALTER ROLE db_datareader ADD MEMBER proteinisi_prod;
  ALTER ROLE db_datawriter ADD MEMBER proteinisi_prod;
  GRANT EXECUTE TO proteinisi_prod;
  IF (SELECT compatibility_level FROM sys.databases WHERE name = 'proteinimkdb') < 160
    ALTER DATABASE proteinimkdb SET COMPATIBILITY_LEVEL = 160;
  ALTER DATABASE proteinimkdb SET RECOVERY SIMPLE;"

echo "Running migrations 0009, 0010"
for f in $(docker exec mssql bash -c "ls $C/sql/migrations/*.sql" | sort); do sql -d proteinimkdb -i "$f" > /dev/null; done

echo "Deploying stored procedures"
count=0
for f in $(docker exec mssql bash -c "ls $C/sql/procedures/*/*.sql" | sort); do
  sql -d proteinimkdb -i "$f" > /dev/null || { echo "FAILED: $f" >&2; exit 1; }
  count=$((count+1))
done
echo "  $count procedure files applied"

echo "After:  $(sql -h -1 -W -Q 'SET NOCOUNT ON; SELECT MAX(Order_Id) FROM proteinimkdb.dbo.Orders')  (max Order_Id)"
sql -h -1 -W -d proteinimkdb -Q "SET NOCOUNT ON; SELECT (SELECT COUNT(*) FROM sys.procedures) AS procs, (SELECT COUNT(*) FROM sys.table_types) AS types"
REMOTE

echo "==> Copying uploaded images"
for d in "${UPLOAD_DIRS[@]}"; do
  [[ -d "$WWW/$d" ]] || continue
  rsync -az "$WWW/$d/" "$HOST:/srv/proteinisi/prod/api/wwwroot/$d/"
  echo "  $d: $(find "$WWW/$d" -type f | wc -l | xargs) files"
done
ssh "$HOST" "chown -R proteinisi:proteinisi /srv/proteinisi/prod/api/wwwroot && systemctl start proteinisi-api-prod"

echo "==> Health check"
for _ in $(seq 1 20); do
  if ssh "$HOST" "curl -fsS -o /dev/null http://127.0.0.1:6800/"; then
    echo "Prod API is up on the old production data."
    exit 0
  fi
  sleep 2
done
echo "API did not come up; check: ssh $HOST journalctl -u proteinisi-api-prod -n 100" >&2
exit 1
