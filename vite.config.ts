import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` keeps asset paths relative so the build works on GitHub Pages
// or any static host, whatever sub-path it is served from.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
