import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your GitHub repo name for Pages
// Your repo is "SaleRecords"
export default defineConfig({
  plugins: [react()],
  base: '/SaleRecords/',
})
