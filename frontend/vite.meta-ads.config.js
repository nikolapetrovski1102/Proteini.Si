import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Meta ads dashboard (meta-ads.proteini.mk): a separate small app sharing this package's dependencies.
//   npm run meta-ads:dev      local dev; set DEV_API_PROXY_TARGET (e.g. https://meta-ads.proteini.mk) in .env.development
//   npm run meta-ads:build    -> dist-meta-ads/
// The API and product images are served from the same origin (nginx), so the app only uses relative URLs.
const here = fileURLToPath(new URL('.', import.meta.url))
const UPLOAD_PATHS = ['uploads', 'product-images', 'product-gallery', 'variant-images', 'variant-gallery']

// index.html loads ../src/metaAds/main.jsx. The build resolves that from disk, but the dev server asks for
// /src/... inside meta-ads/, so point those requests at the shared src folder.
const devSourceOutsideRoot = {
  name: 'meta-ads-dev-src',
  apply: 'serve',
  resolveId(id) {
    return id.startsWith('/src/') ? fileURLToPath(new URL(`.${id}`, import.meta.url)) : null
  },
}

// The server's session cookie is "__Host-pmads" (Secure, https only), which browsers drop on http://localhost.
// In dev only, the proxy renames it to a plain cookie for the browser and back again for the server.
const SERVER_COOKIE = '__Host-pmads'
const LOCAL_COOKIE = 'pmads_local'
const localSessionCookie = (proxy) => {
  proxy.on('proxyReq', (req) => {
    const cookie = req.getHeader('cookie')
    if (typeof cookie === 'string') req.setHeader('cookie', cookie.replace(`${LOCAL_COOKIE}=`, `${SERVER_COOKIE}=`))
  })
  proxy.on('proxyRes', (res) => {
    const cookies = res.headers['set-cookie']
    if (!cookies) return
    res.headers['set-cookie'] = cookies.map((c) =>
      c.startsWith(`${SERVER_COOKIE}=`) ? c.replace(SERVER_COOKIE, LOCAL_COOKIE).replace(/;\s*secure/i, '') : c,
    )
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, here, '')
  const target = env.DEV_API_PROXY_TARGET
  const proxy = target
    ? Object.fromEntries(
        ['api', ...UPLOAD_PATHS].map((p) => [`/${p}/`, { target, changeOrigin: true, secure: true, configure: localSessionCookie }]),
      )
    : undefined

  return {
    root: fileURLToPath(new URL('./meta-ads', import.meta.url)),
    envDir: here,
    plugins: [react(), devSourceOutsideRoot],
    server: { proxy, port: 5174, fs: { allow: [here] } },
    build: { outDir: fileURLToPath(new URL('./dist-meta-ads', import.meta.url)), emptyOutDir: true },
  }
})
