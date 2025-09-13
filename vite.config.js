import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild", // yoki "terser"
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // limitni oshirish
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("antd")) return "vendor_antd";
            if (id.includes("react")) return "vendor_react";
            return "vendor";
          }
        },
      },
    },
  },

  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  plugins: [react(),tailwindcss(),],

  server: {
        host: true,
        port: 3002,
    }
})