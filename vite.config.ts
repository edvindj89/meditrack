import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg'],
      manifest: {
        name: 'Meditrack',
        short_name: 'Meditrack',
        description:
          'Track on-demand medicines and see when the next dose is allowed.',
        theme_color: '#2563eb',
        background_color: '#f6f7fb',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'app-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
