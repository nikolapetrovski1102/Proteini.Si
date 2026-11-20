#!/usr/bin/env bash
# Security hardening for the Hetzner box (ssh proteinisi). Run from the repo root on your Mac:
#
#   deploy/harden-server.sh headers    # browser security headers + CSP (report-only) on prod + stage
#   deploy/harden-server.sh firewall   # only Cloudflare may reach ports 80/443; SSH stays open
#   deploy/harden-server.sh all        # both, headers first
#
# headers:  installs deploy/nginx/proteinisi-security-headers.conf and proteinisi-shop-csp.conf to
#           /etc/nginx/snippets/ and adds `include` lines to the LIVE vhosts in place (keeps Certbot's
#           SSL lines). Backs the vhosts up first and restores them if `nginx -t` fails. Safe to re-run:
#           snippets are refreshed, includes are only added once.
# firewall: ufw with default deny incoming, SSH allowed from anywhere (not rate-limited, deploy.sh opens
#           many connections), 80/443 only from Cloudflare's published ranges. If you ever get locked out,
#           open the Hetzner Cloud console for the server and run `ufw disable`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-proteinisi}"
ORIGIN_IP="${ORIGIN_IP:-2.31.111.65}"
MODE="${1:-}"

headers() {
  echo "==> Uploading header snippets"
  scp -q "$ROOT/deploy/nginx/proteinisi-security-headers.conf" "$ROOT/deploy/nginx/proteinisi-shop-csp.conf" \
    "$HOST:/etc/nginx/snippets/"

  echo "==> Patching live vhosts"
  ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
STAMP=$(date +%Y%m%d%H%M%S)
CONFS="/etc/nginx/sites-available/proteinisi-prod.conf /etc/nginx/sites-available/proteinisi-stage.conf"
for c in $CONFS; do cp -p "$c" "/root/$(basename "$c").bak-$STAMP"; done
echo "Backups: /root/*.conf.bak-$STAMP"

python3 - $CONFS <<'EOF'
import re, sys
SEC = "include /etc/nginx/snippets/proteinisi-security-headers.conf;"
CSP = "include /etc/nginx/snippets/proteinisi-shop-csp.conf;"
for p in sys.argv[1:]:
    s = open(p).read()
    if "proteinisi-security-headers.conf" in s:
        print(f"{p}: already patched")
        continue
    out, names, index = [], 0, 0
    for line in s.split("\n"):
        out.append(line)
        ind = re.match(r"\s*", line).group(0)
        if re.match(r"\s*server_name (proteini\.mk|stage\.proteini\.mk);", line):
            out.append(ind + SEC); names += 1
        elif re.match(r"\s*location = /index\.html \{", line):
            out.append(ind + "    " + CSP); index += 1
        elif re.match(r"\s*add_header Cache-Control", line):
            out.append(ind + SEC)
    if names == 0 or index == 0:
        sys.exit(f"{p}: unexpected layout (server_name={names}, index.html={index}); nothing changed")
    open(p, "w").write("\n".join(out))
    print(f"{p}: patched ({names} server blocks, {index} index.html locations)")
EOF

if nginx -t 2>&1; then
  systemctl reload nginx
  echo "nginx reloaded"
else
  for c in $CONFS; do cp -p "/root/$(basename "$c").bak-$STAMP" "$c"; done
  echo "nginx -t failed; vhosts restored from backup" >&2
  exit 1
fi
REMOTE

  echo "==> Checking live headers"
  sleep 2
  curl -sSI https://proteini.mk/ | grep -iE "strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|content-security" || {
    echo "Headers not visible yet (check Cloudflare cache / Transform Rules)" >&2; exit 1; }
}

firewall() {
  echo "==> Configuring ufw"
  ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
command -v ufw >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get install -y -q ufw

V4=$(curl -fsS --max-time 15 https://www.cloudflare.com/ips-v4)
V6=$(curl -fsS --max-time 15 https://www.cloudflare.com/ips-v6)
[ "$(echo "$V4" | grep -c /)" -ge 10 ] || { echo "Could not fetch Cloudflare ranges; nothing changed" >&2; exit 1; }

SSH_PORTS=$(sshd -T 2>/dev/null | awk '/^port /{print $2}' | sort -u)
SSH_PORTS=${SSH_PORTS:-22}

echo "Publicly listening before:"; ss -tlnH | awk '{print "  " $4}' | grep -vE '^  (127\.|\[::1\])' | sort -u

ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
for p in $SSH_PORTS; do ufw allow "$p/tcp" comment 'SSH' >/dev/null; done
for r in $V4 $V6; do ufw allow proto tcp from "$r" to any port 80,443 comment 'Cloudflare' >/dev/null; done

# Drop any open-to-everyone web rules from earlier setups.
for rule in "80/tcp" "443/tcp" "80" "443" "Nginx Full" "Nginx HTTP" "Nginx HTTPS" "80,443/tcp"; do
  ufw delete allow "$rule" >/dev/null 2>&1 || true
done

ufw --force enable
ufw status | head -8; echo "  ... $(ufw status | grep -c Cloudflare) Cloudflare rules"
REMOTE

  echo "==> Verifying"
  ssh -o ConnectTimeout=10 "$HOST" true && echo "SSH: still works"
  printf "Site via Cloudflare: "; curl -s -o /dev/null -w '%{http_code}\n' --max-time 15 https://proteini.mk/
  printf "Origin direct (should time out): "
  curl -sk -o /dev/null -w '%{http_code}\n' --max-time 8 --resolve "proteini.mk:443:$ORIGIN_IP" https://proteini.mk/ || echo "blocked"
}

case "$MODE" in
  headers) headers ;;
  firewall) firewall ;;
  all) headers; firewall ;;
  *) echo "Usage: $0 headers|firewall|all" >&2; exit 2 ;;
esac
