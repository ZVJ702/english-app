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
      manifest: {
        name: 'English App', short_name: 'English', lang: 'vi', start_url: '.', display: 'standalone',
        description: 'Học từ vựng và luyện viết tiếng Anh với lặp lại ngắt quãng',
        theme_color: '#2456d6', background_color: '#f6f5f1',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
})
