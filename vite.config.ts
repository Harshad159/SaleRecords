import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: set 'base' to '/<your-repo-name>/' if deploying to GitHub Pages
// e.g., base: '/narsinha-sales-pwa/'
export default defineConfig({
  plugins: [react()],
  base: '',
})
