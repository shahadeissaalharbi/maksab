import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.up.railway.app'],
  },
  preview: {
    allowedHosts: ['.up.railway.app'],
  },
})
