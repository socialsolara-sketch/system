import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@themes': path.resolve(__dirname, './src/assets/themes'),
      '@fonts': path.resolve(__dirname, './src/assets/fonts'),
      '@layout': path.resolve(__dirname, './src/shared/layout'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  assetsInclude: ['**/*.db'],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
})

