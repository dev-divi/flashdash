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
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'FlashDash — Invoice for Pros',
        short_name: 'FlashDash',
        description: 'One-tap invoicing for mobile service pros. No subscriptions. No login. Just work.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#3b82f6',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
          { src: '/icons/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
          { src: '/icons/maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
