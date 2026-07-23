import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    base: '/',

    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      sourcemap: isDevelopment ? 'inline' : false,
      minify: !isDevelopment,
    },

    server: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 8443,
      strictPort: true,
    },

    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 8443,
    },
  }
})