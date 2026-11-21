# Meta ads dashboard (meta-ads.proteini.mk)

Staff-only page for making Facebook/Instagram ads from shop products: pick products, choose a card style,
edit the text, check the preview, then publish. Ads are published **paused** by default.

## How it fits together

| Part | Where |
|---|---|
| Page (React, separate Vite app) | `frontend/meta-ads/index.html`, `frontend/src/metaAds/`, `frontend/vite.meta-ads.config.js` |
| API | `MetaAdsAuthController`, `MetaAdsController` in the prod API, under `/api/meta-ads/` |
| Logic | `backend/Application/ProteiniSi.Services/MetaAds/` |
| nginx | `deploy/nginx/proteinisi-meta-ads.conf` (only `/api/meta-ads/` is proxied) |
| Deploy | `deploy/deploy.sh prod meta-ads` (also part of `prod all`) |

* **Sign-in.** Duo Universal Prompt, or a 6-digit code sent by email as the fallback. Only emails in
  `MetaAds__AllowedUsers` get in. That list is checked again on every request, so removing someone takes
  effect straight away. The session is an HttpOnly cookie (`__Host-pmads`) that lasts 12 hours by default.
* **Card images.** The browser draws each card as a 1080×1080 JPEG with one of four styles: Clean, Price,
  Bold or Photo. It then uploads the image to the ad account. A card can use your own photo instead of the
  product photo.
* **Database.** No changes. Drafts are kept in the browser.

## Secrets and settings

Put these in `/etc/proteinisi/prod.env` on the server, then run `systemctl restart proteinisi-api-prod`.

```bash
MetaAds__PublicUrl=https://meta-ads.proteini.mk
# Who may sign in. Separate with commas. Use "email=duoUsername" when the Duo username is not the email.
MetaAds__AllowedUsers=you@proteini.mk,manager@proteini.mk=manager
MetaAds__SessionHours=12
MetaAds__EmailCodeEnabled=true

# Duo (Duo Admin Panel → Applications → Protect an Application → "Web SDK")
MetaAds__Duo__ClientId=DIXXXXXXXXXXXXXXXXXX
MetaAds__Duo__ClientSecret=...
MetaAds__Duo__ApiHost=api-xxxxxxxx.duosecurity.com

# Meta Marketing API
MetaAds__AccessToken=EAAG...            # system user token, see below
MetaAds__AppSecret=...                  # app secret; signs every call (appsecret_proof)
MetaAds__AdAccountId=1234567890         # with or without "act_"
MetaAds__PageId=1234567890
MetaAds__InstagramUserId=1784...        # optional; without it ads run on Facebook only
MetaAds__PixelId=1234567890             # optional; needed only for the "Sales" goal
MetaAds__ApiVersion=v24.0
```

Email codes are sent through the existing shop mail settings.

### Meta: getting the token and IDs

1. **App.** Go to developers.facebook.com → My Apps → Create app → type **Business**, and connect it to
   the Proteini Business portfolio. Add the **Marketing API** product. Copy **App settings → Basic →
   App secret** into `AppSecret`.
2. **System user.** In business.facebook.com go to Settings → Users → **System users** → Add, and pick
   the **Admin** role.
   * Assign assets: the **ad account** (full control / Manage campaigns), the **Facebook Page** (create
     ads / full control), and the **Instagram account**.
   * Under Settings → Accounts → **Apps**, add the app from step 1 to the business.
3. **Token.** On the system user, click **Generate new token**, choose the app and set expiry to **Never**.
   * Tick these scopes: `ads_management`, `ads_read`, `business_management`, `pages_show_list`,
     `pages_read_engagement`, `instagram_basic`.
   * Put the token in `AccessToken`. It is only ever sent in the Authorization header and never shown
     in the page.
4. **IDs.**
   * Ad account ID: Ads Manager, the number in `act=` in the address bar.
   * Page ID: Page → About → Page transparency, or Business Settings → Pages.
   * Instagram user ID: Business Settings → Instagram accounts. It is the long number, not the
     @username.
   * Pixel ID: Events Manager → Data sources. It is the same ID as `VITE_META_PIXEL_ID` for the shop.
5. **Payment method.** The ad account needs a payment method. Ads stay paused until someone switches
   them on in the dashboard or in Ads Manager.

### Feeds, Stories and Reels

Every card is drawn twice: a square 1080×1080 image for feeds and a full-screen 1080×1920 image for
Stories and Reels. The 9:16 image keeps the top 14% and the bottom ~31% free, because Meta puts the page
name there, and the caption and button. The Design step has a "Feeds 1:1 / Stories & Reels 9:16" switch
that shows both, with those bands marked.

* **Single image and Collection:** one ad that carries both images. Meta shows the square one in feeds
  and the 9:16 one in Stories/Reels (placement asset customization, `asset_feed_spec`). With the
  "Feeds" placement only the square image is uploaded and the ad is a plain link ad.
* **Carousel with a new ad set and placements that include Stories/Reels:** one campaign with the
  budget on the campaign (Advantage campaign budget) and two ad sets: "· feeds" with the carousel in
  Facebook/Instagram feeds, and "· stories & reels" with one full-screen ad per card. Meta moves the
  money to whichever works better.
* **Carousel with the "Stories & Reels" placement:** only the full-screen ads (no carousel).
* **Carousel in feeds, or added to an existing ad set:** the carousel alone, as before.

### Collection ads

The **Collection** format needs no setup in Meta. It is one image ad: the cover banner (big text,
small text, up to three products) with the first four products and their prices under it, plus Meta's
button. There is a feed version (1080×1090) and a Stories/Reels version (1080×1920).

Tapping the ad opens `https://proteini.mk/collection?p=v12,p5,…&t=title&s=subtitle` (with UTM tags):
a shop page with the title, the subtitle and a 2-column grid of every picked product (4–50). The page
reads names, photos and prices from `GET /api/feed/collection?items=…` (the same data as the Meta
catalog feed, cached for 10 minutes), keeps the order of the ad and skips products that are gone. Each
product opens its product page. The link uses the same site as the products, so stage ads open stage.

The header of the dashboard shows the account, currency, Page, Instagram and Pixel it is connected to.
If something is missing, a yellow note at the top lists which settings are missing.

### Duo

1. In the Duo Admin Panel go to Applications → **Protect an Application** → **Web SDK** → Protect.
   Copy the Client ID, Client secret and API hostname into the settings above.
2. Each person in `AllowedUsers` must be a Duo user whose **username** is their email. If the username
   is different, write the entry as `email=username`. They also need the Duo Mobile app enrolled.
3. Duo returns the user to `https://meta-ads.proteini.mk/api/meta-ads/auth/duo/callback`. That works
   once the DNS name and certificate below are in place.

If Duo is not configured or can't be reached, the page offers only the email code.

## Server setup (one time)

1. **Cloudflare DNS.** Add an `A` record for `meta-ads` pointing to `2.31.111.65`, proxied.
2. **nginx.** Copy the vhost, enable it and get a certificate:
   ```bash
   scp deploy/nginx/proteinisi-meta-ads.conf proteinisi:/etc/nginx/sites-available/
   ssh proteinisi 'ln -sf /etc/nginx/sites-available/proteinisi-meta-ads.conf /etc/nginx/sites-enabled/ \
     && mkdir -p /srv/proteinisi/meta-ads/web && nginx -t && systemctl reload nginx \
     && certbot --nginx -d meta-ads.proteini.mk'
   ```
3. **Deploy.** Add the settings to `prod.env`, then deploy the API and the page:
   `deploy/deploy.sh prod api`, then `deploy/deploy.sh prod meta-ads`.

## Local development

Add `DEV_API_PROXY_TARGET=https://meta-ads.proteini.mk` to `frontend/.env.development`, then run
`npm run meta-ads:dev` on port 5174. The session cookie is `Secure` and `__Host-`, so sign-in only
works over https. It is easiest to test on the server.
