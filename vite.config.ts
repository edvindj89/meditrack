import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const githubPagesBase = '/meditrack/'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? githubPagesBase : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'app-icon.svg',
          'app-icon-192.png',
          'app-icon-512.png',
          'apple-touch-icon.png',
          'favicon-64.png',
        ],
        manifest: {
          name: 'Meditrack',
          short_name: 'Meditrack',
          description:
            'Track on-demand medicines and see when the next dose is allowed.',
          theme_color: '#2563eb',
          background_color: '#f6f7fb',
          display: 'standalone',
          start_url: githubPagesBase,
          scope: githubPagesBase,
          icons: [
            {
              src: 'app-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'app-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'app-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  }
})
