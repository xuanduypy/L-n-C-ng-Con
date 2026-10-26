import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'DiNo - Đọc Sách & Nghe Nhạc',
          short_name: 'DiNo',
          description: 'DiNo - Ứng dụng đọc sách nói AI, kho nhạc thiếu nhi với các album tuyển chọn, phòng thu giọng người dùng và đồng bộ dữ liệu đám mây.',
          theme_color: '#FEF08A',
          background_color: '#FEFCE8',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['education', 'music', 'books'],
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
          shortcuts: [
            {
              name: 'Kho Nhạc',
              short_name: 'Nhạc',
              description: 'Nghe các album nhạc thiếu nhi rộn ràng',
              url: '/?tab=music',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Kho Sách',
              short_name: 'Sách',
              description: 'Đọc và nghe sách nói AI',
              url: '/?tab=books',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
      {
        name: 'gemini-api-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            const pathname = url.split('?')[0];
            if (pathname.startsWith('/api/')) {
              try {
                const { handleApiRoute } = await import('./src/server/apiHandler.ts');
                const handled = await handleApiRoute(req, res, pathname);
                if (handled) return;
              } catch (e: any) {
                console.error('API route error:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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

