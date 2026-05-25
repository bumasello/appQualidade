import * as xlsx from "xlsx"; // Use * as xlsx para consistência
import { AppError } from "../error/appError";
import type {
  ExcelProcessingResult,
  VinculoMedicoExcelRow,
} from "../type/excel";

class ExcelService {
  // Definir explicitamente todas as chaves da interface VinculoMedicoExcelRow
  // Isso garante que temos acesso a elas em tempo de execução.
  private readonly ALL_VINCULO_MEDICO_EXCEL_ROW_KEYS: (keyof VinculoMedicoExcelRow)[] =
    [
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
      // console.log("1. Cabeçalhos lidos da planilha (trim):", headers);
      // console.log("2. Cabeçalhos requeridos:", requiredHeaders);

      const dataRows: (string | number | boolean | null)[][] = rawData.slice(1);

      const missingRequiredHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingRequiredHeaders.length > 0) {
        // console.log(
        //   "3. Cabeçalhos requeridos ausentes (se houver):",
        //   missingRequiredHeaders,
        // );
        throw new AppError(
          `Cabeçalhos obrigatórios ausentes na planilha: ${missingRequiredHeaders.join(
            ", ",
          )}.`,
          400,
        );
      }

      // Agora, usamos a lista explícita de chaves
      const validExcelRowKeys = new Set(this.ALL_VINCULO_MEDICO_EXCEL_ROW_KEYS);
      // console.log(
      //   "4. Chaves válidas na interface VinculoMedicoExcelRow:",
      //   Array.from(validExcelRowKeys),
      // ); // Agora não será vazio!

      dataRows.forEach(
        (row: (string | number | boolean | null)[], rowIndex: number) => {
          const rowNum = rowIndex + 2;
          const rowErrors: { message: string; column?: string }[] = [];
          let mappedRow: Partial<VinculoMedicoExcelRow> = {};

          headers.forEach((headerName: string, colIndex: number) => {
            // O headerName lido da planilha deve corresponder a uma chave da interface
            const propName = headerName as keyof VinculoMedicoExcelRow;

            // Verifica se o nome do cabeçalho da planilha é uma propriedade válida na nossa interface
            if (validExcelRowKeys.has(propName)) {
              const cellValue =
                row[colIndex] !== undefined
                  ? String(row[colIndex]).trim()
                  : null;
              (mappedRow as any)[propName] = cellValue;
            }
          });

          // console.log(
          //   `5. Linha ${rowNum} - Objeto mapeado antes da validação de presença:`,
          //   mappedRow,
          // );

          requiredHeaders.forEach((requiredHeader) => {
            const propName = requiredHeader as keyof VinculoMedicoExcelRow;
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
      result.errors.push({ row: 0, message: result.message });
      result.failedCount = result.processedCount + result.failedCount;
      result.processedCount = 0;
      result.data = [];
      return result;
    }
  }

  public readSheetAsMap<
    T extends Record<string, string | null> = Record<string, string | null>,
  >(
    buffer: Buffer,
  ): {
    headers: string[];
    rows: T[];
  } {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new AppError("Planilha sem dados na primeira aba!", 400);

    const raw = xlsx.utils.sheet_to_json<(string | number | boolean | null)[]>(
      sheet,
      { header: 1 },
    );
    if (raw.length === 0) throw new AppError("Planilha vazia!", 400);

    const headers = (raw[0] as (string | null)[]).map((h) =>
      String(h ?? "").trim(),
    );
    const rows = raw.slice(1).map((row) => {
      const record: Record<string, string | null> = {};
      headers.forEach((h, idx) => {
        const val = (row as (string | number | boolean | null)[])[idx];
        record[h] = val != null ? String(val).trim() : null;
      });

      return record;
    });

    return { headers, rows: rows as T[] };
  }
}

export default ExcelService;
