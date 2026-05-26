import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";

const rootPkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"),
) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // <--- Adicione ou altere esta linha
  build: {
    outDir: "dist",
  },
  define: {
    __APP_VERSION__: JSON.stringify(rootPkg.version),
  },
  resolve: {
    // Adicione esta seção
    alias: {
      "@": path.resolve(__dirname, "./src"), // Mapeia @ para a pasta src
    },
  },
});
