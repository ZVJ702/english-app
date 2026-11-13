import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', // đường dẫn tương đối: chạy được trên GitHub Pages với bất kỳ tên repo nào
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
      manifest: {
        name: 'English App', short_name: 'English', lang: 'vi', start_url: '.', display: 'standalone',
        description: 'Học từ vựng và luyện viết tiếng Anh với lặp lại ngắt quãng',
        theme_color: '#e6e0fb', background_color: '#fdf8f3',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
})
