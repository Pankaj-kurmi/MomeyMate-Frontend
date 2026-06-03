import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    cssCodeSplit: true,
    reportCompressedSize: true,
    cssMinify: true
  },
  
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1.0')
      }
    }
  },
  
  preview: {
    port: 4173,
    strictPort: false,
    open: true
  },
  
  logLevel: 'info'
})
