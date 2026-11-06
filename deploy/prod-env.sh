#!/usr/bin/env bash
# Fill /etc/proteinisi/prod.env with the secrets prod is still missing, copied from stage.env
# (PasswordKey, cPay merchant + key, MKhost SMTP), and set the values that must differ on prod.
#
#   deploy/prod-env.sh            # from the laptop; edits the server over ssh
#
# - Backs up prod.env first (prod.env.bak-<timestamp>). Safe to re-run.
# - Mail recipients are NOT copied: stage points them at a test inbox; prod falls back to the
#   shop addresses built into OrderEmailService, exactly like the old site.
# - BackendUrl must be https://proteini.mk: it builds the cPay return URL, and the bank only
#   accepts the registered domain. proteini.mk/api is proxied to this API by nginx.
# - Prints keys only, never secret values. Does not restart the API.
set -euo pipefail
HOST="${DEPLOY_HOST:-proteinisi}"

ssh "$HOST" python3 - <<'EOF'
import shutil, time
P, ST = "/etc/proteinisi/prod.env", "/etc/proteinisi/stage.env"
shutil.copy2(P, P + ".bak-" + time.strftime("%Y%m%d%H%M%S"))

def load(p):
    out = {}
    for line in open(p).read().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            out[k] = v
    return out

prod, stage = load(P), load(ST)
for k in ["AppSettings__PasswordKey",
          "CPayConfiguration__PayToMerchant", "CPayConfiguration__MerchantName",
          "CPayConfiguration__SecretKey", "CPayConfiguration__Currency", "CPayConfiguration__Language",
          "MailSettings__host", "MailSettings__SMTPPort", "MailSettings__EnableSsl",
          "MailSettings__sender_email", "MailSettings__sender_username", "MailSettings__sender_password"]:
    if k in stage:
        prod[k] = stage[k]
    else:
        print("WARNING: missing in stage.env:", k)

prod["CPayConfiguration__TestMode"] = "false"
prod["AppSettings__BackendUrl"] = "https://proteini.mk"
prod["AppSettings__FrontendUrl"] = "https://proteini.mk"
for k in ("MailSettings__OrderNotificationEmail", "MailSettings__OrderCopyRecipients"):
    prod.pop(k, None)

open(P, "w").write("".join(f"{k}={v}\n" for k, v in prod.items()))
for k, v in prod.items():
    secret = any(s in k.lower() for s in ("password", "key", "secret", "connection"))
    print(f"  {k} = {'***' if secret else v}")
EOF
echo "prod.env updated. Restart with: ssh $HOST systemctl restart proteinisi-api-prod"
