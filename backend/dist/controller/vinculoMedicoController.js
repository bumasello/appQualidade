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
                res
                    .status(201)
                    .json({ success: result.success, message: result.message });
            }
            else {
                throw new appError_1.AppError(result.message, 400);
            }
        }
        catch (error) {
            next(error);
        }
    };
    buscaMedico = async (req, res, next) => {
        try {
            const { crm, uf } = req.query;
            if (!crm || !uf) {
                throw new appError_1.AppError("[buscaMedico] Todos os campos são obrigatórios!", 422);
            }
            let crmValue;
            let ufValue;
            // Validação para crm
            if (typeof crm === "string") {
                crmValue = crm;
            }
            else if (Array.isArray(crm) && typeof crm[0] === "string") {
                crmValue = crm[0]; // Pega o primeiro valor se for um array de strings
            }
            else {
                // Se crm for undefined, ParsedQs, ou um array de algo que não é string
                throw new appError_1.AppError("[buscaMedico] CRM inválido ou ausente!", 422);
            }
            // Validação para uf
            if (typeof uf === "string") {
                ufValue = uf;
            }
            else if (Array.isArray(uf) && typeof uf[0] === "string") {
                ufValue = uf[0]; // Pega o primeiro valor se for um array de strings
            }
            else {
                // Se uf for undefined, ParsedQs, ou um array de algo que não é string
                throw new appError_1.AppError("[buscaMedico] UF inválido ou ausente!", 422);
            }
            const result = await this.viculoMedicoService.buscaMedico(crmValue, ufValue);
            if (result.success) {
                res.status(200).json({ message: result.message, data: result.data });
            }
            else {
                throw new appError_1.AppError(result.message || "Erro ao buscar médico.", 400);
            }
        }
        catch (error) {
            next(error);
        }
    };
}
exports.VinculoMedicoController = VinculoMedicoController;
