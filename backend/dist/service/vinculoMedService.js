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
    async processaVinculoMedicoBatch(data) {
        const result = {
            success: true,
            message: "Processamento de vínculos em lote concluído.",
            totalProcessed: data.length,
            successfulUpdates: 0,
            failedUpdates: 0,
            errors: [],
        };
        let conn;
        try {
            conn = await oracleDatabase_1.default.getConnection();
            // A transação é iniciada implicitamente com a primeira DML e autoCommit: false
            for (const rowData of data) {
                try {
                    // Validações de Regra de Negócio
                    // rowData["Nº conselho"], rowData["UF conselho"], rowData.NR_CPF são garantidos como não-nulos pelo ExcelProcessingService
                    // Validação de formato de CPF
                    // if (!isValidCPF(rowData.NR_CPF)) {
                    //   result.failedUpdates++;
                    //   result.errors.push({
                    //     rowData,
                    //     message: "CPF inválido.",
                    //     type: "business",
                    //   });
                    //   continue;
                    // }
                    // Validação de UF (formato ou lista de UFs válidas)
                    const ufConselho = rowData["UF conselho"]?.toUpperCase();
                    const validUFs = [
                        "AC",
                        "AL",
                        "AP",
                        "AM",
                        "BA",
                        "CE",
                        "DF",
                        "ES",
                        "GO",
                        "MA",
                        "MT",
                        "MS",
                        "MG",
                        "PA",
                        "PB",
                        "PR",
                        "PE",
                        "PI",
                        "RJ",
                        "RN",
                        "RS",
                        "RO",
                        "RR",
                        "SC",
                        "SP",
                        "SE",
                        "TO",
                    ];
                    if (!ufConselho || !validUFs.includes(ufConselho)) {
                        result.failedUpdates++;
                        result.errors.push({
                            rowData,
                            message: `UF '${rowData["UF conselho"]}' inválido.`,
                            type: "business",
                        });
                        continue;
                    }
                    // Realizar a operação de UPDATE no banco de dados
                    // A query é fixa: "update bcr.BCR_CTR_EXT_CNS_PRF set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf"
                    // O objeto de parâmetros DEVE ter as chaves 'cpf', 'crm' e 'uf'
                    const updateResult = await conn.execute("update bcr.BCR_CTR_EXT_CNS_PRF set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf", {
                        // Mapeia os dados da planilha para os nomes dos parâmetros de bind da query
                        cpf: rowData["CPF rec Federal"], // Valor da coluna NR_CPF da planilha para o bind :cpf
                        crm: rowData["Nº conselho"], // Valor da coluna "Nº conselho" da planilha para o bind :crm
                        uf: rowData["UF conselho"], // Valor da coluna "UF conselho" da planilha para o bind :uf
                    }, { autoCommit: false });
                    if (updateResult.rowsAffected && updateResult.rowsAffected > 0) {
                        result.successfulUpdates++;
                    }
                    else {
                        result.failedUpdates++;
                        result.errors.push({
                            rowData,
                            message: "Registro de médico não encontrado para atualização.",
                            type: "db",
                        });
                    }
                }
                catch (rowError) {
                    result.failedUpdates++;
                    result.errors.push({
                        rowData,
                        message: `Erro DB: ${rowError.message}`,
                        type: "db",
                    });
                }
            }
            // Se não houve falhas, faz o commit de todas as operações
            if (result.failedUpdates === 0) {
                await conn.commit();
            }
            else {
                // Se houve falhas, reverte todas as operações
                await conn.rollback();
                result.success = false;
                result.message = `Processamento de vínculos concluído com ${result.failedUpdates} falhas. A transação foi revertida.`;
            }
        }
        catch (error) {
            if (conn) {
                try {
                    await conn.rollback();
                    console.error("Transação revertida devido a erro geral.");
                }
                catch (rollbackError) {
                    console.error("Erro ao tentar reverter transação:", rollbackError);
                }
            }
            console.error("[VinculoMedicoService] Erro geral no processamento em lote:", error);
            result.success = false;
            result.message =
                "Erro interno no servidor ao processar o lote de vínculos.";
            result.errors = [
                {
                    rowData: {},
                    message: result.message,
                    type: "db",
                },
            ];
            result.successfulUpdates = 0;
            result.failedUpdates = data.length;
        }
        finally {
            if (conn) {
                try {
                    await conn.close();
                }
                catch (closeError) {
                    console.error("Erro ao fechar a conexão:", closeError);
                }
            }
        }
        return result;
    }
}
exports.default = VinculoMedicoService;
