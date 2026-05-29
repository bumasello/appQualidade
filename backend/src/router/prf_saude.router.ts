import { Router } from "express";
import { PrfSaudeController } from "../controller/prf_saude.controller";
import upload from "../config/multerConfig";
import isAuth from "../middleware/isAuth";

const router = Router();

const prf_saude_controller = new PrfSaudeController();

router.get("/buscar", isAuth, prf_saude_controller.busca_profissional);

router.get("/listar_conselhos", isAuth, prf_saude_controller.lista_conselhos);

router.post("/vincular", isAuth, prf_saude_controller.vincula_profissional);

router.post(
  "/replicar_curriculo",
  isAuth,
  upload.single("file"),
  prf_saude_controller.replicaCurriculoPrf,
);

router.post(
  "/vincularbatch",
  isAuth,
  upload.single("excelFile"),
  prf_saude_controller.vinculaMedicoBatch,
);

export default router;
