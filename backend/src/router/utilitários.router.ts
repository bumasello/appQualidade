import Router from "express";
import isAuth from "../middleware/isAuth";
import upload from "../config/multerConfig";
import UtilitariosService from "../service/utilitarios.service";
import { UtilitariosController } from "../controller/utilitarios.controller";

const router = Router();
const utilitariosController = new UtilitariosController();

router.post(
  "/comparador-planilhas",
  isAuth,
  upload.fields([
    { name: "fileOld", maxCount: 1 },
    { name: "fileNew", maxCount: 1 },
  ]),
  utilitariosController.comparadorPlanilha,
);

export default router;
