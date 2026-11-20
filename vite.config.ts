import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', // đường dẫn tương đối: chạy được trên GitHub Pages với bất kỳ tên repo nào
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2,wasm}'], maximumFileSizeToCacheInBytes: 3_000_000},
      manifest: {
        name: 'English App', short_name: 'English', lang: 'vi', start_url: '.', display: 'standalone',
        description: 'Học từ vựng và luyện viết tiếng Anh với lặp lại ngắt quãng',
        theme_color: '#221f33', background_color: '#fdf8f3',
        icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }],
      },
    }),
  ],
})
