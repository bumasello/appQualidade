import Router from "express";
import upload from "../config/multerConfig";
import { UtilitariosController } from "../controller/utilitarios.controller";
import hasAccess from "../middleware/hasAccess";
import isAuth from "../middleware/isAuth";

const router = Router();
const utilitariosController = new UtilitariosController();

router.post(
  "/comparador-planilhas",
  isAuth,
  hasAccess("comparador-planilhas"),
  upload.fields([
    { name: "fileOld", maxCount: 1 },
    { name: "fileNew", maxCount: 1 },
  ]),
  utilitariosController.comparadorPlanilha,
);

export default router;
