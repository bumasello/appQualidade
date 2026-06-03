import { Router } from "express";
import { EquipeController } from "../controller/equipe.controller";
import hasAccess from "../middleware/hasAccess";
import isAuth from "../middleware/isAuth";

const equipe_controller = new EquipeController();

const router = Router();

router.get(
  "/listar",
  isAuth,
  hasAccess("configuracoes"),
  equipe_controller.listar,
);

router.post(
  "/criar",
  isAuth,
  hasAccess("configuracoes"),
  equipe_controller.criar,
);

router.get(
  "/:id/telas",
  isAuth,
  hasAccess("configuracoes"),
  equipe_controller.listar_telas,
);

router.put(
  "/:id/telas",
  isAuth,
  hasAccess("configuracoes"),
  equipe_controller.definir_telas,
);

export default router;
