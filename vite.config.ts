/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // 루트에서 서빙한다고 가정한다 (npm run dev / vite preview 기본값, 또는 도메인 루트 배포).
  // 하위 경로에 배포한다면 이 값을 그 경로로 바꾸세요.
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ClaudeFit — Claude Code 학습 트레이닝',
        short_name: 'ClaudeFit',
        description: 'Claude Code 공식 문서를 이론 + 실습 + 반복 복습으로 체득하는 학습 앱',
        theme_color: '#14130f',
        background_color: '#14130f',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // public/content/는 수백 개의 md 파일이라 앱 셸만 선캐시하고
        // 문서 본문·검색 코퍼스·폰트는 런타임 캐싱으로 처리한다.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            // content/docs/*.md, content/docs-index.json, content/search-corpus.json 전부 포함
            urlPattern: /\/content\/.*\.(md|json)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'cc-dojo-docs' },
          },
          {
            urlPattern: /\.woff2?$/,
            handler: 'CacheFirst',
            options: { cacheName: 'cc-dojo-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
  },
})
