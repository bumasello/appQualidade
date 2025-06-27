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
    // Adicionado 'async' pois retorna uma Promise
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

      // rawData será um array de arrays, onde cada array interno é uma linha.
      // Os tipos dos elementos nos arrays internos podem variar (string, number, boolean, null).
      const rawData: (string | number | boolean | null)[][] =
        xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length === 0) {
        throw new AppError("A planilha está vazia.", 400);
      }

      // Cabeçalhos são esperados como strings da primeira linha
      const headers: string[] = rawData[0].map((h) => String(h).trim());
      const dataRows: (string | number | boolean | null)[][] = rawData.slice(1);

      const missingRequiredHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingRequiredHeaders.length > 0) {
        throw new AppError(
          `Cabeçalhos obrigatórios ausentes na planilha: ${missingRequiredHeaders.join(", ")}.`,
          400,
        );
      }

      // Obtém todas as chaves válidas da interface VinculoMedicoExcelRow para segurança de tipo
      // Isso garante que só mapeamos para propriedades que realmente existem na nossa interface
      const validExcelRowKeys = new Set(
        Object.keys({} as VinculoMedicoExcelRow),
      );

      dataRows.forEach(
        (row: (string | number | boolean | null)[], rowIndex: number) => {
          const rowNum = rowIndex + 2; // Número da linha real na planilha (1 para cabeçalho + 1 para índice 0)
          const rowErrors: { message: string; column?: string }[] = [];
          let mappedRow: Partial<VinculoMedicoExcelRow> = {}; // Objeto para armazenar os dados mapeados

          // Itera sobre todos os cabeçalhos encontrados na planilha
          headers.forEach((headerName: string, colIndex: number) => {
            // Garante que headerName é uma chave da VinculoMedicoExcelRow
            const propName = headerName as keyof VinculoMedicoExcelRow;

            // Atribui o valor apenas se o headerName for uma propriedade válida na nossa interface
            if (validExcelRowKeys.has(propName)) {
              const cellValue =
                row[colIndex] !== undefined
                  ? String(row[colIndex]).trim()
                  : null;
              // O cast para `any` aqui é frequentemente necessário para atribuição dinâmica de propriedades em TS.
              // A segurança de tipo é mantida pela verificação `validExcelRowKeys.has(propName)`.
              (mappedRow as any)[propName] = cellValue;
            }
          });

          // Agora, valida a PRESENÇA de valores para os cabeçalhos REQUERIDOS
          requiredHeaders.forEach((requiredHeader) => {
            const propName = requiredHeader as keyof VinculoMedicoExcelRow;
            // Verifica se o valor mapeado para o cabeçalho obrigatório é nulo ou vazio
            if (!mappedRow[propName]) {
              // Verifica por null, undefined, ''
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
      // IMPORTANTE: Retorna o objeto 'result' aqui
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
