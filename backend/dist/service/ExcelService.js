"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx = __importStar(require("xlsx")); // Use * as xlsx para consistência
const appError_1 = require("../error/appError");
class ExcelService {
    // Definir explicitamente todas as chaves da interface VinculoMedicoExcelRow
    // Isso garante que temos acesso a elas em tempo de execução.
    ALL_VINCULO_MEDICO_EXCEL_ROW_KEYS = [
        "SISTEMA",
        "UNIDADE",
        "CONCAT",
        "ESTABELECIMENTO",
        "BIP_PROFISSIONAL",
        "CHAVE_ORIGEM",
        "PACIENTE",
        "FUNCIONÁRIO",
        "NOME",
        "NOME_SOC",
        "PARTICULARIDADE",
        "NR_CPF",
        "DT_NASC",
        "VINCULO_MEDICO",
        "NR_DOC_PROF",
        "UF_DOCUMENTO",
        "ESPECIALIDADE",
        "MAE",
        "NM_MAE_CACHE",
        "PAI",
        "MOTIVO_INVALIDO",
        "CAMPO_INVALIDO",
        "CONTEUDO_INVALIDO",
        "CPF_UNIFICADO",
        "DT_INVALIDO",
        "CPF rec Federal",
        "Nome Rec. Federal",
        "Dt. Nasc. Rec. Federal",
        "Nome conselho",
        "Nº conselho",
        "UF conselho",
        "CONSELHO",
        "ANALISE",
        "AÇÃO",
    ];
    async processVinculoExcel(buffer, requiredHeaders) {
        const result = {
            success: true,
            message: "Processamento estrutural do Excel concluído.",
            processedCount: 0,
            failedCount: 0,
            errors: [],
            data: [],
        };
        try {
            const workbook = xlsx.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                throw new appError_1.AppError("A planilha não contém dados na primeira aba.", 400);
            }
            const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            if (rawData.length === 0) {
                throw new appError_1.AppError("A planilha está vazia.", 400);
            }
            const headers = rawData[0].map((h) => String(h).trim());
            // console.log("1. Cabeçalhos lidos da planilha (trim):", headers);
            // console.log("2. Cabeçalhos requeridos:", requiredHeaders);
            const dataRows = rawData.slice(1);
            const missingRequiredHeaders = requiredHeaders.filter((h) => !headers.includes(h));
            if (missingRequiredHeaders.length > 0) {
                // console.log(
                //   "3. Cabeçalhos requeridos ausentes (se houver):",
                //   missingRequiredHeaders,
                // );
                throw new appError_1.AppError(`Cabeçalhos obrigatórios ausentes na planilha: ${missingRequiredHeaders.join(", ")}.`, 400);
            }
            // Agora, usamos a lista explícita de chaves
            const validExcelRowKeys = new Set(this.ALL_VINCULO_MEDICO_EXCEL_ROW_KEYS);
            // console.log(
            //   "4. Chaves válidas na interface VinculoMedicoExcelRow:",
            //   Array.from(validExcelRowKeys),
            // ); // Agora não será vazio!
            dataRows.forEach((row, rowIndex) => {
                const rowNum = rowIndex + 2;
                const rowErrors = [];
                let mappedRow = {};
                headers.forEach((headerName, colIndex) => {
                    // O headerName lido da planilha deve corresponder a uma chave da interface
                    const propName = headerName;
                    // Verifica se o nome do cabeçalho da planilha é uma propriedade válida na nossa interface
                    if (validExcelRowKeys.has(propName)) {
                        const cellValue = row[colIndex] !== undefined
                            ? String(row[colIndex]).trim()
                            : null;
                        mappedRow[propName] = cellValue;
                    }
                });
                // console.log(
                //   `5. Linha ${rowNum} - Objeto mapeado antes da validação de presença:`,
                //   mappedRow,
                // );
                requiredHeaders.forEach((requiredHeader) => {
                    const propName = requiredHeader;
                    // Verifica se o valor mapeado para o cabeçalho obrigatório é nulo ou vazio
                    if (!mappedRow[propName]) {
                        // console.log(
                        //   `6. Erro na linha ${rowNum}: Valor ausente para "${requiredHeader}". Valor mapeado:`,
                        //   mappedRow[propName],
                        // );
                        rowErrors.push({
                            message: `${requiredHeader} é obrigatório.`,
                            column: requiredHeader,
                        });
                    }
                });
                if (rowErrors.length > 0) {
                    result.failedCount++;
                    result.errors.push({
                        row: rowNum,
                        message: rowErrors.map((e) => e.message).join("; "),
                    });
                }
                else {
                    result.processedCount++;
                    result.data.push(mappedRow);
                }
            });
            if (result.failedCount > 0) {
                result.success = false;
                result.message = `Processamento estrutural do Excel concluído com ${result.failedCount} erros.`;
            }
            return result;
        }
        catch (error) {
            result.success = false;
            result.message =
                error instanceof appError_1.AppError
                    ? error.message
                    : "Erro inesperado ao processar o ficheiro Excel.";
            result.errors.push({ row: 0, message: result.message });
            result.failedCount = result.processedCount + result.failedCount;
            result.processedCount = 0;
            result.data = [];
            return result;
        }
    }
}
exports.default = ExcelService;
