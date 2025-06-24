"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
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
    async buscaMedico(crm, uf) {
        const medico = {
            crm: crm,
            uf: uf,
        };
        const conn = await oracleDatabase_1.default.getConnection();
        try {
            const result = await conn.execute("SELECT nome, NR_DOC_PRF AS crm, SG_UF AS uf, NR_CPF AS cpf FROM bcr.BCR_CTR_EXT_CNS_PRF WHERE NR_DOC_PRF = :crm AND SG_UF = :uf", { crm: medico.crm, uf: medico.uf }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
            if (result.rows && result.rows.length > 0) {
                const medico = result.rows[0];
                return {
                    success: true,
                    message: "Médico encontrado com sucesso!",
                    data: medico,
                };
            }
            else {
                return {
                    success: false,
                    message: "Médico não encontrado.",
                };
            }
        }
        catch (error) {
            console.error("[VinculoMedicoService] Erro ao realizar busca do médico: ", error);
            throw new Error("Erro ao criar vínculo médico.");
        }
        finally {
            await conn.close();
        }
    }
}
exports.default = VinculoMedicoService;
