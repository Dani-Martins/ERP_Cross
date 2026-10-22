import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'lan-read-only-api',
    configureServer(server) {
      server.middlewares.use('/api', (request, response, next) => {
        const address = request.socket.remoteAddress;
        const isLocal = address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
        const isRead = ['GET', 'HEAD', 'OPTIONS'].includes(request.method ?? '');

        if (!isLocal && !isRead) {
          response.statusCode = 403;
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(JSON.stringify({ message: 'Acesso pela rede permitido somente para consulta.' }));
          return;
        }

        next();
      });
    },
  }],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5015',
        changeOrigin: true,
      },
    },
  },
})
