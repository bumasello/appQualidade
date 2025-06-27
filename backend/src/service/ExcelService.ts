import * as xlsx from "xlsx"; // Use * as xlsx para consistência
import { AppError } from "../error/appError";
import type {
  ExcelProcessingResult,
  VinculoMedicoExcelRow,
} from "../type/excel";

class ExcelService {
  // Renomeado para ExcelProcessingService
  /**
   * processVinculoExcel
   * Processa um buffer de arquivo Excel, valida cabeçalhos e mapeia dados para objetos tipados.
   * @param buffer O buffer do arquivo Excel.
   * @param requiredHeaders Uma lista de cabeçalhos que são obrigatórios na planilha.
   * @returns Uma Promise que resolve para ExcelProcessingResult contendo os dados processados ou erros.
   */
  public async processVinculoExcel(
    buffer: Buffer,
    requiredHeaders: string[],
  ): Promise<ExcelProcessingResult> {
    const result: ExcelProcessingResult = {
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
        throw new AppError("A planilha não contém dados na primeira aba.", 400);
      }

      const rawData: (string | number | boolean | null)[][] =
        xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length === 0) {
        throw new AppError("A planilha está vazia.", 400);
      }

      const headers: string[] = rawData[0].map((h) => String(h).trim());
      console.log("1. Cabeçalhos lidos da planilha (trim):", headers); // <-- NOVO LOG
      console.log("2. Cabeçalhos requeridos:", requiredHeaders); // <-- NOVO LOG

      const dataRows: (string | number | boolean | null)[][] = rawData.slice(1);

      const missingRequiredHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingRequiredHeaders.length > 0) {
        console.log(
          "3. Cabeçalhos requeridos ausentes (se houver):",
          missingRequiredHeaders,
        ); // <-- NOVO LOG
        throw new AppError(
          `Cabeçalhos obrigatórios ausentes na planilha: ${missingRequiredHeaders.join(", ")}.`,
          400,
        );
      }

      const validExcelRowKeys = new Set(
        Object.keys({} as VinculoMedicoExcelRow),
      );
      console.log(
        "4. Chaves válidas na interface VinculoMedicoExcelRow:",
        Array.from(validExcelRowKeys),
      ); // <-- NOVO LOG

      dataRows.forEach(
        (row: (string | number | boolean | null)[], rowIndex: number) => {
          const rowNum = rowIndex + 2;
          const rowErrors: { message: string; column?: string }[] = [];
          let mappedRow: Partial<VinculoMedicoExcelRow> = {};

          headers.forEach((headerName: string, colIndex: number) => {
            const propName = headerName as keyof VinculoMedicoExcelRow;

            // A condição correta para atribuição é apenas verificar se a propriedade existe na interface
            // A sua condição anterior era: propName in mappedRow || typeof mappedRow[propName] !== "undefined" || typeof ({} as VinculoMedicoExcelRow)[propName] !== "undefined"
            // Que é equivalente a validExcelRowKeys.has(propName)
            if (validExcelRowKeys.has(propName)) {
              // Use esta condição simplificada e correta
              const cellValue =
                row[colIndex] !== undefined
                  ? String(row[colIndex]).trim()
                  : null;
              (mappedRow as any)[propName] = cellValue;
            }
          });

          console.log(
            `5. Linha ${rowNum} - Objeto mapeado antes da validação de presença:`,
            mappedRow,
          ); // <-- NOVO LOG

          requiredHeaders.forEach((requiredHeader) => {
            const propName = requiredHeader as keyof VinculoMedicoExcelRow;
            // Verifica se o valor mapeado para o cabeçalho obrigatório é nulo ou vazio
            if (!mappedRow[propName]) {
              console.log(
                `6. Erro na linha ${rowNum}: Valor ausente para "${requiredHeader}". Valor mapeado:`,
                mappedRow[propName],
              ); // <-- NOVO LOG
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
          } else {
            result.processedCount++;
            result.data.push(mappedRow as VinculoMedicoExcelRow);
          }
        },
      );

      if (result.failedCount > 0) {
        result.success = false;
        result.message = `Processamento estrutural do Excel concluído com ${result.failedCount} erros.`;
      }
      return result;
    } catch (error: any) {
      result.success = false;
      result.message =
        error instanceof AppError
          ? error.message
          : "Erro inesperado ao processar o ficheiro Excel.";
      result.errors.push({ row: 0, message: result.message }); // Erro geral
      result.failedCount = result.processedCount + result.failedCount; // Marca todas as linhas como falhas se for um erro geral
      result.processedCount = 0;
      result.data = [];
      // IMPORTANTE: Retorna o objeto 'result' aqui também
      return result;
    }
  }
}

export default ExcelService;
