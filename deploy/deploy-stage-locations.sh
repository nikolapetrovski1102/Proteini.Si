#!/usr/bin/env bash
# Deploy migration 0015 + AddressLookup stored procedures to the staging database,
# then publish and deploy the API and frontend to stage.proteini.mk.
#
# Usage:
#   ./deploy/deploy-stage-locations.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-proteinisi}"
REMOTE_SQL_DIR="/srv/mssql/backup/stage-address-lookup"

echo "==> 1. Uploading migration 0015 and AddressLookup stored procedures to $HOST:$REMOTE_SQL_DIR"
ssh "$HOST" "mkdir -p $REMOTE_SQL_DIR/procedures"
rsync -az "$ROOT/database/migrations/0015_create-countries-cities-postcodes.sql" "$HOST:$REMOTE_SQL_DIR/"
rsync -az "$ROOT/database/procedures/AddressLookup/"*.sql "$HOST:$REMOTE_SQL_DIR/procedures/"
ssh "$HOST" "chown -R 10001 $REMOTE_SQL_DIR"

echo "==> 2. Applying migration 0015 and stored procedures on staging SQL Server"
ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
set -a; . /root/.proteinisi/secrets.env; set +a

STAGE_DB=$(grep -E "Database=|Initial Catalog=" /etc/proteinisi/stage.env | sed -E "s/.*(Database|Initial Catalog)=([^;'\"]+).*/\2/" | head -n 1 | tr -d "\r\n" || true)
STAGE_DB="${STAGE_DB:-proteinimkdb_stage}"
echo "Target stage database: $STAGE_DB"

sql() {
  docker exec -e SQLCMDPASSWORD="$SA_PASSWORD" mssql \
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -I -d "$STAGE_DB" "$@"
}

sql -i /var/opt/mssql/backup/stage-address-lookup/0015_create-countries-cities-postcodes.sql
for f in $(docker exec mssql bash -c "ls /var/opt/mssql/backup/stage-address-lookup/procedures/*.sql" | sort); do
  echo "  Applied $(basename "$f")"
  sql -i "$f" > /dev/null
done
echo "Database migration and stored procedures applied."
REMOTE

echo "==> 3. Running deploy/deploy.sh stage"
"$ROOT/deploy/deploy.sh" stage
