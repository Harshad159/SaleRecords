import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(<App />)

// PWA: register service worker with a RELATIVE path (works on GitHub Pages)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(console.error)
  })
}
