"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinculoMedicoController = void 0;
const appError_1 = require("../error/appError");
const vinculoMedService_1 = __importDefault(require("../service/vinculoMedService"));
class VinculoMedicoController {
    viculoMedicoService;
    constructor() {
        this.viculoMedicoService = new vinculoMedService_1.default();
    }
    vinculaMedico = async (req, res, next) => {
        try {
            const { crm, uf, cpf } = req.body;
            if (!crm || !uf || !cpf) {
                throw new appError_1.AppError("[vinculaMedico] Todos os campos são obrigatórios!", 422);
            }
            const result = await this.viculoMedicoService.realizaVinculoMedico(crm, uf, cpf);
            if (result.success) {
                res.status(201).json({ message: result.message });
            }
            else {
                throw new appError_1.AppError(result.message, 400);
            }
        }
        catch (error) {
            next(error);
        }
    };
}
exports.VinculoMedicoController = VinculoMedicoController;
