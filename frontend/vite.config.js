import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxyTarget = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:18000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Use IPv4 loopback by default; override when smoke backend runs on another port.
      "/api": proxyTarget,
    },
  },
});
