import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5175', 
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
