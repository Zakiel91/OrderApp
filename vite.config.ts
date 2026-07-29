import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Innovation Diamonds - Orders',
        short_name: 'Orders',
        description: 'Jewelry Production Order App',
        // Aligned with the light app theme (--color-surface / --color-bg). The
        // previous dark slate values fought the actual UI in standalone mode.
        theme_color: '#ffffff',
        background_color: '#f4f6fa',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // SPA fallback: opening the installed app offline should show the shell
        // (and the app's own error/retry states), not the browser's dinosaur.
        navigateFallback: 'index.html',
        // Never serve a cached shell for API calls.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Google Fonts stylesheet — stale-while-revalidate so headings keep
            // Playfair Display offline instead of falling back to Georgia.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Font files are immutable — cache them for a year.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Orders list / detail: serve from network, fall back to the last
            // successful response when offline. Deliberately NOT applied to
            // POST/PUT/DELETE — Workbox only caches GET.
            urlPattern: /\/api\/production\/(orders|order)\b/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'orders-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
})
