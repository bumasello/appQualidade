"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vinculoMedicoController_1 = require("../controller/vinculoMedicoController");
const multerConfig_1 = __importDefault(require("../config/multerConfig"));
const router = (0, express_1.Router)();
const vinculoMedicoController = new vinculoMedicoController_1.VinculoMedicoController();
router.post("/vincular", vinculoMedicoController.vinculaMedico);
router.get("/buscar", vinculoMedicoController.buscaMedico);
router.post("/vincularbatch", multerConfig_1.default.single("excelFile"), vinculoMedicoController.vinculaMedicoBatch);
exports.default = router;
