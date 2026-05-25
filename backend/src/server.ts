import { config } from "dotenv";
import { join } from "path";
import oracledb from "oracledb";
import App from "./App";
import mdm_database from "./database/mdm_database";
import qld_database from "./database/qld_database";

config({ path: join(__dirname, "../.env") });

const app = new App(8080);

(async () => {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });

    await mdm_database.initPool();
    await qld_database.initPool();

    app.listen();
  } catch (error) {
    console.error("Erro ao iniciar pool Oracle.", error);
    process.exit(1);
  }
})();
