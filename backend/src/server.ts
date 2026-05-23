import { config } from "dotenv";
import { join } from "path";
import App from "./App";
import OracleDatabase from "./database/oracleDatabase";

config({ path: join(__dirname, "../.env") });

const app = new App(8080);

(async () => {
  try {
    await OracleDatabase.initPool();

    app.listen();
  } catch (error) {
    console.error("Erro ao iniciar pool Oracle.", error);
    process.exit(1);
  }
})();
