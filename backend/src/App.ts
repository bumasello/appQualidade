import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler";

import coberturas_router from "./router/cobertura.router";
import equipe_router from "./router/equipe.router";
import prfsaude_router from "./router/prf_saude.router";
import telas_router from "./router/tela.router";
import user_router from "./router/user.router";
import utilitarios_router from "./router/utilitarios.router";

class App {
  public app: express.Application;
  private port: number;

  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.initMiddleware();
    this.initRoute();
    this.initErrorHandler();
  }

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      console.log("Api on air.");
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `ERRO FATAL: a porta ${this.port} ja esta em uso. ` +
            "Provavelmente o outro ambiente (PRD ou HML) esta aberto. " +
            "Feche o outro app e abra este novamente.",
        );
      } else {
        console.error(`ERRO FATAL ao subir o servidor: ${err.message}`);
      }
      process.exit(1);
    });
  }

  public getPort(): number {
    return this.port;
  }

  private initRoute(): void {
    this.app.use("/prf_saude", prfsaude_router);
    this.app.use("/user", user_router);
    this.app.use("/utilitarios", utilitarios_router);
    this.app.use("/tela", telas_router);
    this.app.use("/equipe", equipe_router);
    this.app.use("/coberturas", coberturas_router);
  }

  private initMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  private initErrorHandler(): void {
    this.app.use(errorHandler);
  }
}

export default App;
