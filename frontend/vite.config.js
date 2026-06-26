import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Use IPv4 loopback to avoid localhost resolving to another :8000 listener.
      "/api": "http://127.0.0.1:8000",
    },
  },
});
