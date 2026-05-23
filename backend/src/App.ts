import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";

import VinculoMedicoRouter from "./router/prf_saude.router";
import UserRouter from "./router/user.router";
import UtilitariosRouter from "./router/utilitários.router";

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
    this.app.listen(this.port, () => {
      console.log("Api on air.");
    });
  }

  public getPort(): number {
    return this.port;
  }

  private initRoute(): void {
    this.app.use("/vinculomedico", VinculoMedicoRouter);
    this.app.use("/user", UserRouter);
    this.app.use("/utilitarios", UtilitariosRouter);
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
