import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
  server: {
    port: 8080,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5175', // Backend Spring Boot port
        changeOrigin: true,
        secure: false,
        bypass: function (req, res, options) {
          // Bypass proxy cho VNPay callback để Frontend xử lý
          if (req.url.startsWith('/api/payment/vnpay-return')) {
            return '/index.html';
          }
        }
      }
    }
  },
})
