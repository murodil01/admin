import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    minify: "esbuild", // yoki "terser"
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("antd")) return "vendor_antd";
            if (id.includes("react")) return "vendor_react";
            return "vendor_misc";
          }
        },
      },
    },
  },

  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    port: 3002,
  },
});