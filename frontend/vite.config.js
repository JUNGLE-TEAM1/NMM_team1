import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        productHealthAirflowDemo: resolve(__dirname, "product-health-airflow-demo.html"),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Use IPv4 loopback to avoid localhost resolving to another :8000 listener.
      "/api": "http://127.0.0.1:8000",
    },
  },
});
