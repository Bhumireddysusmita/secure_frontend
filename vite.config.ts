import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// The dev server proxies /api to the FastAPI backend, so the browser sees one
// origin. That keeps the session cookie first-party (SameSite=Lax works) and
// lets the backend's same-origin CSRF check pass without CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.API_PROXY_TARGET || "http://127.0.0.1:8001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: false },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: false },
      },
    },
  };
});
