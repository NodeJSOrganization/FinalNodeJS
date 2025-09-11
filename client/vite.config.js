import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Chuỗi '/api' là tiền tố của các API request bạn muốn proxy
      '/api': {
        target: 'http://localhost:5000', // Địa chỉ server backend của bạn
        changeOrigin: true, // Cần thiết cho virtual hosted sites
        // rewrite: (path) => path.replace(/^\/api/, '') // Nếu backend không có /api
      }
    }
  }
})
