import { Router } from "express";
import { PrfSaudeController } from "../controller/prf_saude.controller";
import upload from "../config/multerConfig";

const router = Router();

const prf_saude_controller = new PrfSaudeController();

router.post("/vincular", prf_saude_controller.vinculaMedico);

router.get("/buscar", prf_saude_controller.buscaMedico);

router.post(
  "/replicar_curriculo",
  upload.single("file"),
  prf_saude_controller.replicaCurriculoPrf,
);

router.post(
  "/vincularbatch",
  upload.single("excelFile"),
  prf_saude_controller.vinculaMedicoBatch,
);

export default router;
