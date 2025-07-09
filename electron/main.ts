import * as fs from "fs";
import * as path from "path";

import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { spawn, ChildProcess } from "child_process";

// Obtenha o caminho do diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let backendProcess: ChildProcess | null = null;

const backendPort: number = 8080;

function startBackend() {
  const backendPath = path.join(__dirname, "../backend/dist/server.js");

  console.log(`Iniciando o backend: ${backendPath}`);
  if (!fs.existsSync(backendPath)) {
    console.error(
      `Erro: Ficheiro do backend não encontrado em ${backendPath}. Certifique-se de que 'bun run build:backend' foi executado.`
    );
    app.quit();
    return;
  }

  let instantClientPath: string;
  if (app.isPackaged) {
    // Em produção (app empacotada)
    instantClientPath = path.join(process.resourcesPath, "instantclient_19_6");
  } else {
    instantClientPath = path.join(__dirname, "../resources/instantclient_19_6"); // <--- CORREÇÃO AQUI
  }

  console.log(`DEBUG: __dirname é: ${__dirname}`); // Adicione este log
  console.log(`DEBUG: instantClientPath calculado é: ${instantClientPath}`); // Adicione este log

  if (!fs.existsSync(instantClientPath)) {
    console.error(
      `Erro: Instant Client não encontrado em ${instantClientPath}.`
    );
    app.quit();
    return;
  }

  backendProcess = spawn("node", [backendPath], {
    env: {
      ...process.env,
      PORT: backendPort.toString(),
      ORACLE_CLIENT_LIB_DIR: instantClientPath,
    },
    stdio: "inherit",
  });

  backendProcess.on("error", (err) => {
    console.log(`Erro ao iniciar o backend: ${err}`);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`Backend encerrado com código: ${code} e sinal: ${signal}`);
  });
}

function createWindow() {
  const iconPath = path.join(__dirname, "../../template/build/favicon.ico");
  console.log(`DEBUG: Caminho do ícone: ${iconPath}`);

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: iconPath,
  });

  // Agora __dirname estará definido
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
