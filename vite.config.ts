import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Must match your repo name for GitHub Pages deployment path
export default defineConfig({
  plugins: [react()],
  base: '/SaleRecords/',
})
