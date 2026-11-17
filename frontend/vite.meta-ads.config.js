import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Meta ads dashboard (meta-ads.proteini.mk): a separate small app sharing this package's dependencies.
//   npm run meta-ads:dev      local dev; set DEV_API_PROXY_TARGET (e.g. https://meta-ads.proteini.mk) in .env.development
//   npm run meta-ads:build    -> dist-meta-ads/
// The API and product images are served from the same origin (nginx), so the app only uses relative URLs.
const here = fileURLToPath(new URL('.', import.meta.url))
const UPLOAD_PATHS = ['uploads', 'product-images', 'product-gallery', 'variant-images', 'variant-gallery']

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, here, '')
  const target = env.DEV_API_PROXY_TARGET
  const proxy = target
    ? Object.fromEntries(['api', ...UPLOAD_PATHS].map((p) => [`/${p}/`, { target, changeOrigin: true, secure: true }]))
    : undefined

  return {
    root: fileURLToPath(new URL('./meta-ads', import.meta.url)),
    envDir: here,
    plugins: [react()],
    server: { proxy, port: 5174 },
    build: { outDir: fileURLToPath(new URL('./dist-meta-ads', import.meta.url)), emptyOutDir: true },
  }
})
