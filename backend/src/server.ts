import { config } from "dotenv";
import { join } from "path";
import { appendFileSync } from "fs";
import oracledb from "oracledb";
import App from "./App";
import mdm_database from "./database/mdm_database";
import qld_database from "./database/qld_database";

config({ path: join(__dirname, "../.env") });

const app = new App(8080);

function logToFile(message: string) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  if (process.env.LOG_FILE) {
    try {
      appendFileSync(process.env.LOG_FILE, line + "\n");
    } catch {
      // ignora erro de log
    }
  }
}

(async () => {
  try {
    logToFile("=== Iniciando backend ===");
    logToFile(`ORACLE_CLIENT_LIB_DIR: ${process.env.ORACLE_CLIENT_LIB_DIR}`);
    logToFile(`NODE_PATH: ${process.env.NODE_PATH}`);
    logToFile(`PORT: ${process.env.PORT}`);

    logToFile("Chamando oracledb.initOracleClient...");
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });
    logToFile("Oracle Client inicializado com sucesso.");

    logToFile("Criando pool MDM...");
    await mdm_database.initPool();
    logToFile("Pool MDM criada.");

    logToFile("Criando pool QLD...");
    await qld_database.initPool();
    logToFile("Pool QLD criada.");

    app.listen();
    logToFile("Backend ouvindo na porta 8080.");
  } catch (error) {
    const msg = error instanceof Error ? error.stack ?? error.message : String(error);
    logToFile(`ERRO FATAL: ${msg}`);
    process.exit(1);
  }
})();
