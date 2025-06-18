import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // <--- Adicione ou altere esta linha
  build: {
    outDir: "dist",
  },
  resolve: {
    // Adicione esta seção
    alias: {
      "@": path.resolve(__dirname, "./src"), // Mapeia @ para a pasta src
    },
  },
});
