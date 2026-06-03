import { Router } from "express";
import { TelaController } from "../controller/tela.controller";
import hasAccess from "../middleware/hasAccess";
import isAuth from "../middleware/isAuth";

const tela_controller = new TelaController();

const router = Router();

router.get(
  "/listar",
  isAuth,
  hasAccess("configuracoes"),
  tela_controller.listar,
);

export default router;
