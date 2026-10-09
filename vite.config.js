import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    watch: {
      ignored: [
        path.resolve(__dirname, 'image') + '/**',
        path.resolve(__dirname, 'songs') + '/**'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000'
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true
      }
    }
  }
})
