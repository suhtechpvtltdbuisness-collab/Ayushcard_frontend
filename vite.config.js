import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://bkbs-backend.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('lucide-react') || id.includes('recharts') || id.includes('react-qr-code')) {
              return 'ui';
            }
            if (id.includes('tesseract.js') || id.includes('jspdf-autotable') || id.includes('html2canvas') || id.includes('dompurify')) {
              return 'utils';
            }
            return 'others';
          }
        }
      }
    }
  }
})