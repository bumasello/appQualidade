"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vinculoMedicoController_1 = require("../controller/vinculoMedicoController");
const router = (0, express_1.Router)();
const vinculoMedicoController = new vinculoMedicoController_1.VinculoMedicoController();
router.post("/vincular", vinculoMedicoController.vinculaMedico);
router.get("/buscar", vinculoMedicoController.buscaMedico);
exports.default = router;
