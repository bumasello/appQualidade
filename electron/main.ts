import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import { autoUpdater } from "electron-updater";

import { app, BrowserWindow, dialog } from "electron";

import { spawn, ChildProcess } from "child_process";

const APP_ENV = process.env.APP_ENV ?? "prd";
const envFile = app.isPackaged
  ? path.join(process.resourcesPath, ".env.app")
  : path.join(__dirname, `../.env.${process.env.APP_ENV ?? "prd"}`);

dotenv.config({ path: envFile });

let backendProcess: ChildProcess | null = null;

const backendPort: number = 8080;

function setupAutoUpdater(win: BrowserWindow) {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", (info) => {
    dialog
      .showMessageBox(win, {
        type: "info",
        title: "Atualização Disponível",
        message: `Versão ${info.version} disponível. Deseja baixar agora?`,
        buttons: ["Baixar", "Depois"],
      })
      .then(({ response }) => {
        if (response == 0) autoUpdater.downloadUpdate();
      });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(win, {
        type: "info",
        title: "Atualização Pronta",
        message: `A atualização foi baixada. O app será reiniciado para instalar. Deseja reiniciar agora?`,
        buttons: ["Reiniciar agora", "Depois"],
      })
      .then(({ response }) => {
        if (response == 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on("error", (err) => {
    console.error("Erro no auto-updater: ", err);
  });

  autoUpdater.checkForUpdates().catch(console.error);
}

function startBackend() {
  const backendPath = path.join(__dirname, "../backend/dist/server.js");

  console.log(`Iniciando o backend: ${backendPath}`);
  if (!fs.existsSync(backendPath)) {
    console.error(
      `Erro: Ficheiro do backend não encontrado em ${backendPath}. Certifique-se de que 'bun run build:backend' foi executado.`,
    );
    app.quit();
    return;
  }

  let instantClientPath: string;
  if (app.isPackaged) {
    instantClientPath = path.join(process.resourcesPath, "instantclient_19_30");
  } else {
    instantClientPath = path.join(
      __dirname,
      "../resources/instantclient_19_30",
    );
  }

  if (!fs.existsSync(instantClientPath)) {
    console.error(
      `Erro: Instant Client não encontrado em ${instantClientPath}.`,
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

  win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));

  return win;
}

app.whenReady().then(() => {
  startBackend();
  const win = createWindow();
  if (app.isPackaged) {
    setupAutoUpdater(win);
  }
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
