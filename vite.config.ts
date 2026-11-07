import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const icon = (src: string, sizes: string, purpose = 'any') => ({ src, sizes, type: src.endsWith('.svg') ? 'image/svg+xml' : 'image/png', purpose });

// Build + dev server; the PWA plugin writes the manifest and a precaching service worker so every page works offline.
export default defineConfig({
  server: { port: 5291, strictPort: true },
  preview: { port: 4291, strictPort: true },
  build: { target: 'es2022' },
  plugins: [
    VitePWA({
      // autoUpdate + the default injectRegister: the new worker takes over at once, so an update never waits on closed tabs.
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Crayonbox',
        short_name: 'Crayonbox',
        description: 'Tap-to-color coloring book for kids. No ads, works offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff6e5',
        theme_color: '#fff6e5',
        icons: [
          icon('icons/icon-192.png', '192x192'),
          icon('icons/icon-512.png', '512x512'),
          icon('icons/icon-512.png', '512x512', 'maskable'),
          icon('icons/icon.svg', 'any'),
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'] },
    }),
  ],
});
