import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    // Allow devices on the same Wi-Fi to open Vite
    host: "0.0.0.0",
    // Allow the temporary HTTPS ngrok URL used for iPhone camera testing.
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app"],

    // Forward API requests to Spring Boot
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});
