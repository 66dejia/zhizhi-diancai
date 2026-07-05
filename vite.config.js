import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteWsPlugin from "./server/vite-ws-plugin.js";

export default defineConfig({
  plugins: [react(), viteWsPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});
