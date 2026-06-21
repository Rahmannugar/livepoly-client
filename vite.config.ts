import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pwaOutputDirectory = process.env.VERCEL
  ? '.vercel/output/static'
  : '.output/public'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      outDir: pwaOutputDirectory,
      manifest: {
        name: 'LivePoly',
        short_name: 'LivePoly',
        description: 'An online Monopoly-inspired board game.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#173a40',
        background_color: '#e7f3ec',
        icons: [
          {
            src: '/icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        navigateFallback: null,
      },
    }),
  ],
})

export default config
