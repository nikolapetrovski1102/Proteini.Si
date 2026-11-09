import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Folders the API serves uploaded images from (relative URLs in API responses).
const UPLOAD_PATHS = ['uploads', 'product-images', 'product-gallery', 'variant-images', 'variant-gallery', 'home-slider']

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  // When set (e.g. https://stage.proteini.mk), `vite dev` forwards /api and the upload folders to
  // that backend, so the browser sees same-origin requests and the remote CORS list doesn't need localhost.
  const target = env.DEV_API_PROXY_TARGET
  const proxy = target
    ? Object.fromEntries(
        ['api', ...UPLOAD_PATHS].map((p) => [`/${p}/`, { target, changeOrigin: true, secure: true }]),
      )
    : undefined

  return {
    plugins: [react()],
    server: { proxy },
  }
})
