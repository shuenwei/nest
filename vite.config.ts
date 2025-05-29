import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),

    tsconfigPaths(),

    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
       devOptions: {
        enabled: true
      },

      pwaAssets: {
      disabled: false,
      config: true,
      },

      manifest: {
        name: "nest",
        short_name: "nest",
        theme_color: "#ffffff",
        display: "standalone"
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
