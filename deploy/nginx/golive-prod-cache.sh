#!/usr/bin/env bash
# Go-live step: switch production image caching to long-lived, immutable headers.
# Run on the server AFTER `deploy/deploy.sh prod` (the new API purges Cloudflare when
# images are replaced or deleted, so long caching is only safe with that code live).
#
#   scp deploy/nginx/golive-prod-cache.sh proteinisi:/root/ && ssh proteinisi bash /root/golive-prod-cache.sh
#
# Edits the live config in place (keeps Certbot/manual changes), backs it up first,
# and restores the backup if `nginx -t` fails.
set -euo pipefail

CONF=/etc/nginx/sites-available/proteinisi-prod.conf
BACKUP=/root/proteinisi-prod.conf.bak-$(date +%Y%m%d%H%M%S)

cp -p "$CONF" "$BACKUP"
echo "Backup: $BACKUP"

python3 - "$CONF" <<'EOF'
import sys
p = sys.argv[1]
s = open(p).read()

web_old = """home-slider)/ {
        root /srv/proteinisi/prod/api/wwwroot;
        expires 30d;
        access_log off;
        try_files $uri =404;"""
web_new = """home-slider)/ {
        root /srv/proteinisi/prod/api/wwwroot;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
        try_files $uri =404;"""

api_old = """    location ~ ^/(uploads|product-images|product-gallery|variant-gallery|variant-images|home-slider|logos|css|js|lib)/ {
        root /srv/proteinisi/prod/api/wwwroot;
        expires 30d;
        access_log off;
        try_files $uri @api;
    }"""
api_new = """    location ~ ^/(uploads|product-images|product-gallery|variant-gallery|variant-images|home-slider)/ {
        root /srv/proteinisi/prod/api/wwwroot;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
        try_files $uri @api;
    }

    # These files keep their names when they change, so keep the cache short.
    location ~ ^/(logos|css|js|lib)/ {
        root /srv/proteinisi/prod/api/wwwroot;
        expires 30d;
        access_log off;
        try_files $uri @api;
    }"""

if "max-age=31536000, immutable" in s:
    print("Already applied, nothing to do.")
    sys.exit(0)
if s.count(web_old) != 1 or s.count(api_old) != 1:
    sys.exit("Config does not match the expected layout; not changed. Edit by hand.")
open(p, "w").write(s.replace(web_old, web_new).replace(api_old, api_new))
print("Patched.")
EOF

if nginx -t; then
  systemctl reload nginx
  echo "nginx reloaded with immutable image caching."
else
  cp -p "$BACKUP" "$CONF"
  echo "nginx -t failed; restored $BACKUP" >&2
  exit 1
fi
