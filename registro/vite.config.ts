import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CAMBIO: Usamos './' para que sea relativo y funcione en cualquier ruta
  base: './', 
})