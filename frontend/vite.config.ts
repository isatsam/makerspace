import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React dev server runs on :5173, the Flask API on :5000 (flask run).
// Proxying /api keeps browser fetches same-origin (so the member_id cookie
// is sent) while routing them to Flask during development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
