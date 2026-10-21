import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // هنا Vite يوصل أي طلب يبدأ بـ /api للباك اللي على الجهاز
    proxy: {
      "/api": "http://localhost:5000",
    },
    // هنا سمحت لروابط Railway تفتح الموقع
    allowedHosts: [".up.railway.app"],
  },
  preview: {
    allowedHosts: [".up.railway.app"],
  },
});