// electron/main.ts
import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { spawn } from "child_process";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var backendProcess = null;
var backendPort = 8080;
function startBackend() {
  const backendPath = path.join(__dirname, "../backend/dist/server.js");
  console.log(`Iniciando o backend: ${backendPath}`);
  if (!fs.existsSync(backendPath)) {
    console.error(
      `Erro: Ficheiro do backend n\xE3o encontrado em ${backendPath}. Certifique-se de que 'bun run build:backend' foi executado.`
    );
    app.quit();
    return;
  }
  let instantClientPath;
  if (app.isPackaged) {
    instantClientPath = path.join(process.resourcesPath, "instantclient_19_6");
  } else {
    instantClientPath = path.join(__dirname, "../resources/instantclient_19_6");
  }
  console.log(`DEBUG: __dirname \xE9: ${__dirname}`);
  console.log(`DEBUG: instantClientPath calculado \xE9: ${instantClientPath}`);
  if (!fs.existsSync(instantClientPath)) {
    console.error(
      `Erro: Instant Client n\xE3o encontrado em ${instantClientPath}.`
    );
    app.quit();
    return;
  }
  backendProcess = spawn("node", [backendPath], {
    env: {
      ...process.env,
      PORT: backendPort.toString(),
      ORACLE_CLIENT_LIB_DIR: instantClientPath
    },
    stdio: "inherit"
  });
  backendProcess.on("error", (err) => {
    console.log(`Erro ao iniciar o backend: ${err}`);
  });
  backendProcess.on("exit", (code, signal) => {
    console.log(`Backend encerrado com c\xF3digo: ${code} e sinal: ${signal}`);
  });
}
function createWindow() {
  const iconPath = path.join(__dirname, "../../template/build/favicon.ico");
  console.log(`DEBUG: Caminho do \xEDcone: ${iconPath}`);
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: iconPath
  });
  win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
}
app.whenReady().then(() => {
  startBackend(), createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  if (backendProcess) {
    console.log("A terminar o processo do backend...");
    backendProcess.kill();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
