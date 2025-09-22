import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // 👇 repo name since you're serving at /BookCycle/
  base: "/BookCycle/",
  plugins: [react(), tailwindcss()],
});
