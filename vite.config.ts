import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Service worker registration is handled directly via `virtual:pwa-register` in src/main.tsx.
// In Vite 8 (especially with HMR disabled via DISABLE_HMR=true), vite-plugin-pwa's injected
// dev-sw HMR entry calls `import.meta.hot.send(...)` before connect and throws SendBeforeConnectError.
const pwaDevHmrGuardPre: Plugin = {
  name: 'rawaj-pwa-dev-hmr-guard-pre',
  apply: 'serve',
  enforce: 'pre',
  resolveId(id) {
    if (id === '/@vite-plugin-pwa/pwa-entry-point-loaded') {
      return '\0rawaj-pwa-entry-point-loaded-noop';
    }
  },
  load(id) {
    if (id === '\0rawaj-pwa-entry-point-loaded-noop') {
      return 'export default function registerDevSW() {}';
    }
  },
};

const pwaDevHmrGuardPost: Plugin = {
  name: 'rawaj-pwa-dev-hmr-guard-post',
  apply: 'serve',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(
        /<script id="vite-plugin-pwa:register-dev-sw"[^>]*>[\s\S]*?<\/script>\s*/g,
        ''
      );
    },
  },
};

export default defineConfig(() => {
  return {
    plugins: [
      pwaDevHmrGuardPre,
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Rawaj Cloud | رواج كلاود',
          short_name: 'Rawaj Cloud',
          description:
            'منصة التخزين السحابي الذكي فائقة الأمان والأداء مع وضع العمل دون اتصال بالإنترنت.',
          theme_color: '#4E115A',
          background_color: '#4E115A',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /\/__offline\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'rawaj-file-explorer-offline-v1',
                expiration: {
                  maxEntries: 250,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|pdf)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'rawaj-media-assets-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 14,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      pwaDevHmrGuardPost,
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
