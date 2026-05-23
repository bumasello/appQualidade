import { Router } from "express";
import { VinculoMedicoController } from "../controller/vinculoMedicoController";
import upload from "../config/multerConfig";

const router = Router();

const vinculoMedicoController = new VinculoMedicoController();

router.post("/vincular", vinculoMedicoController.vinculaMedico);

router.get("/buscar", vinculoMedicoController.buscaMedico);

router.post(
  "/vincularbatch",
  upload.single("excelFile"),
  vinculoMedicoController.vinculaMedicoBatch
);

export default router;
