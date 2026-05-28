import "./oracledb-preload";
import { config } from "dotenv";
import { join } from "path";
import oracledb from "oracledb";
import App from "./App";
import mdm_database from "./database/mdm_database";
import qld_database from "./database/qld_database";

config({ path: join(__dirname, "../.env") });

const REQUIRED_ENV = [
  "MDM_USER",
  "MDM_PASSWORD",
  "MDM_CONNECT_STRING",
  "QLD_USER",
  "QLD_PASSWORD",
  "QLD_CONNECT_STRING",
  "JWT_SECRET",
  "MDM_TBL_USUARIOS",
  "MDM_SEQ_USUARIOS",
  "MDM_TBL_PRF_CADASTRO",
  "QLD_TBL_MEDICOS",
  "QLD_TBL_MEDICOS_ONCO",
  "SMTP_HOST",
  "SMTP_PORT",
];

const app = new App(8080);

(async () => {
  try {
    console.log("=== Iniciando backend ===");
    console.log(`ORACLE_CLIENT_LIB_DIR: ${process.env.ORACLE_CLIENT_LIB_DIR}`);
    console.log(`ORACLEDB_PATH: ${process.env.ORACLEDB_PATH}`);
    console.log(`PORT: ${process.env.PORT}`);

    const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Variaveis de ambiente faltando: ${missing.join(", ")}`);
    }

    console.log("Chamando oracledb.initOracleClient...");
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });
    console.log("Oracle Client inicializado com sucesso.");

    console.log("Criando pool MDM...");
    await mdm_database.initPool();
    console.log("Pool MDM criada.");

    console.log("Criando pool QLD...");
    await qld_database.initPool();
    console.log("Pool QLD criada.");

    app.listen();
    console.log("Backend ouvindo na porta 8080.");
  } catch (error) {
    const msg =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    console.error(`ERRO FATAL: ${msg}`);
    process.exit(1);
  }
})();
