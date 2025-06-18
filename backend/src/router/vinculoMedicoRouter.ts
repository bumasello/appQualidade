import { Router } from "express";
import { VinculoMedicoController } from "../controller/vinculoMedicoController";

const router = Router();

const vinculoMedicoController = new VinculoMedicoController();

router.post("/vincular", vinculoMedicoController.vinculaMedico);

export default router;
