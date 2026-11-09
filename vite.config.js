import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Suppress chunk size warning for the large food data file
    chunkSizeWarningLimit: 8000, // 8 MB
  },
  json: {
    // Keep large JSON as separate files, don't inline
    namedExports: false,
  }
})
