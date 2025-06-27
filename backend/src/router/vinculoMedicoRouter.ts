import { Router } from "express";
import { VinculoMedicoController } from "../controller/vinculoMedicoController";

const router = Router();

const vinculoMedicoController = new VinculoMedicoController();

router.post("/vincular", vinculoMedicoController.vinculaMedico);

router.get("/buscar", vinculoMedicoController.buscaMedico);

router.post("vincularbatch", vinculoMedicoController.vinculaMedicoBatch);

export default router;
