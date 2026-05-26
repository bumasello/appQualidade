import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import { autoUpdater } from "electron-updater";

import { app, BrowserWindow, dialog, utilityProcess } from "electron";

const envFile = app.isPackaged
  ? path.join(process.resourcesPath, ".env.app")
  : path.join(__dirname, `../.env.${process.env.APP_ENV ?? "prd"}`);

dotenv.config({ path: envFile });

let backendProcess: Electron.UtilityProcess | null = null;

const backendPort: number = 8080;

function setupAutoUpdater(win: BrowserWindow, logPath: string) {
  const updLog = (msg: string) => {
    try {
      fs.appendFileSync(
        logPath,
        `[updater ${new Date().toISOString()}] ${msg}\n`,
      );
    } catch {
      // ignora
    }
  };

  autoUpdater.autoDownload = false;
  updLog(`versao atual: ${app.getVersion()}`);

  autoUpdater.on("checking-for-update", () => updLog("checando..."));
  autoUpdater.on("update-not-available", (info) =>
    updLog(`nenhuma atualizacao (remota=${info.version})`),
  );
  autoUpdater.on("download-progress", (p) =>
    updLog(`download: ${p.percent.toFixed(1)}%`),
  );

  autoUpdater.on("update-available", (info) => {
    updLog(`update disponivel: ${info.version}`);
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
    updLog("download concluido");
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
    updLog(`ERRO: ${err.stack ?? err.message}`);
  });

  autoUpdater.checkForUpdates().catch((err) => {
    updLog(`checkForUpdates rejected: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
  });
}

function startBackend(logPath: string) {
  const backendPath = app.isPackaged
    ? path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "backend",
        "dist",
        "server.js",
      )
    : path.join(__dirname, "../backend/dist/server.js");

  const instantClientPath = app.isPackaged
    ? path.join(process.resourcesPath, "instantclient_19_30")
    : path.join(__dirname, "../resources/instantclient_19_30");

  const oracledbPath = app.isPackaged
    ? path.join(process.resourcesPath, "oracledb")
    : "";

  fs.writeFileSync(
    logPath,
    `=== Iniciando ${new Date().toISOString()} ===\n` +
      `app.isPackaged: ${app.isPackaged}\n` +
      `process.resourcesPath: ${process.resourcesPath}\n` +
      `backendPath: ${backendPath} (exists=${fs.existsSync(backendPath)})\n` +
      `instantClientPath: ${instantClientPath} (exists=${fs.existsSync(instantClientPath)})\n` +
      `oracledbPath: ${oracledbPath} (exists=${oracledbPath ? fs.existsSync(oracledbPath) : "n/a"})\n` +
      `--- output do backend abaixo ---\n`,
  );

  if (!fs.existsSync(backendPath)) {
    const msg = `Backend não encontrado em ${backendPath}`;
    fs.appendFileSync(logPath, msg + "\n");
    dialog.showErrorBox("Erro", msg);
    app.quit();
    return;
  }

  if (!fs.existsSync(instantClientPath)) {
    const msg = `Instant Client não encontrado em ${instantClientPath}`;
    fs.appendFileSync(logPath, msg + "\n");
    dialog.showErrorBox("Erro", msg);
    app.quit();
    return;
  }

  backendProcess = utilityProcess.fork(backendPath, [], {
    stdio: "pipe",
    env: {
      ...process.env,
      PORT: backendPort.toString(),
      ORACLE_CLIENT_LIB_DIR: instantClientPath,
      ORACLEDB_PATH: oracledbPath,
      LOG_FILE: logPath,
    },
  });

  let outputBuffer = "";

  const capture = (chunk: Buffer) => {
    const text = chunk.toString();
    outputBuffer += text;
    try {
      fs.appendFileSync(logPath, text);
    } catch {
      // ignora erro de escrita no log
    }
  };

  backendProcess.stdout?.on("data", capture);
  backendProcess.stderr?.on("data", capture);

  backendProcess.on("spawn", () => {
    fs.appendFileSync(logPath, "[main] backend spawn event\n");
  });

  backendProcess.on("exit", (code) => {
    fs.appendFileSync(logPath, `[main] backend exit code=${code}\n`);
    if (code !== 0) {
      let msg = outputBuffer;
      if (!msg) {
        try {
          msg = fs.readFileSync(logPath, "utf-8");
        } catch {
          msg = `Código de saída: ${code}\nLog: ${logPath}`;
        }
      }
      dialog.showErrorBox("Erro ao iniciar o backend", msg);
    }
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
  const logDir = app.getPath("userData");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, "backend.log");
  startBackend(logPath);
  const win = createWindow();
  if (app.isPackaged) {
    setupAutoUpdater(win, logPath);
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
