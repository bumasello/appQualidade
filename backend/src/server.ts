import App from "./App";
import OracleDatabase from "./database/oracleDatabase";

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
