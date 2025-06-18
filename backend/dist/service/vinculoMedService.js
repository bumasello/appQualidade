"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracleDatabase_1 = __importDefault(require("../database/oracleDatabase"));
const vinculoMedico_1 = __importDefault(require("../model/vinculoMedico"));
class VinculoMedicoService {
    async realizaVinculoMedico(crm, uf, cpf) {
        const vinculo = new vinculoMedico_1.default({ crm, uf, cpf });
        const conn = await oracleDatabase_1.default.getConnection();
        try {
            const result = await conn.execute("update bcr.BCR_CTR_EXT_CNS_PRF set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf", { cpf: vinculo.cpf, crm: vinculo.crm, uf: vinculo.uf }, { autoCommit: true });
            if (result.rowsAffected && result.rowsAffected > 0) {
                return {
                    success: true,
                    message: "Vinculo Realizado!",
                };
            }
            else {
                return {
                    success: false,
                    message: "Nenhum Vínculo Realizado!",
                };
            }
        }
        catch (error) {
            console.error("[VinculoMedicoService] Erro ao realizar vínculo médico:", error);
            throw new Error("Erro ao criar vínculo médico.");
        }
        finally {
            await conn.close();
        }
    }
}
exports.default = VinculoMedicoService;
