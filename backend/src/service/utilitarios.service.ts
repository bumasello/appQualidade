import App from "../App";
import { AppError } from "../error/appError";
import ExcelService from "./excel.service";

export interface CellDiff {
  de: string | null;
  para: string | null;
}

export interface ChangeRow {
  chave: string;
  tipo: "alterado" | "apagado" | "novo";
  campos: Record<string, CellDiff>;
}

export interface ComparadorResult {
  stats: {
    totalChavesOld: number;
    totalChavesNew: number;
    changedRows: number;
    deletedRows: number;
    newRows: number;
    missingColumns: string[];
  };
  changes: ChangeRow[];
}

class UtilitariosService {
  private excelService: ExcelService;

  constructor() {
    this.excelService = new ExcelService();
  }

  private buildMapByChave(
    rows: Record<string, string | null>[],
  ): Map<string, Record<string, string | null>> {
    const map = new Map<string, Record<string, string | null>>();

    for (const row of rows) {
      const chave = row["CHAVE"];
      if (!chave) continue;
      map.set(chave, row);
    }
    console.log("Amostra de CHAVEs:", [...map.keys()].slice(0, 5));
    return map;
  }

  public compararPlanilhas(
    bufferOld: Buffer,
    bufferNew: Buffer,
    selectedColumns: string[],
  ): ComparadorResult {
    const { rows: rowsOld } = this.excelService.readSheetAsMap(bufferOld);
    const { headers: headersNew, rows: rowsNew } =
      this.excelService.readSheetAsMap(bufferNew);

    if (!headersNew.includes("CHAVE"))
      throw new AppError("Coluna CHAVE não encontrada na planilha nova!", 400);
    const mapOld = this.buildMapByChave(rowsOld);
    const mapNew = this.buildMapByChave(rowsNew);

    const columnsInNew = new Set(headersNew);
    const missingColumns = selectedColumns.filter((c) => !columnsInNew.has(c));
    const columnsToCompare = selectedColumns.filter((c) => columnsInNew.has(c));

    const changes: ChangeRow[] = [];

    for (const [chave, oldRecord] of mapOld) {
      if (!mapNew.has(chave)) {
        const campos: Record<string, CellDiff> = {};
        for (const col of columnsToCompare)
          campos[col] = {
            de: oldRecord[col] ?? null,
            para: "Registro Apagado",
          };
        changes.push({ chave, tipo: "novo", campos });
      }
    }

    for (const [chave, oldRecord] of mapOld) {
      const newRecord = mapNew.get(chave);
      if (!newRecord) continue;

      const campos: Record<string, CellDiff> = {};
      let hasChanges = false;

      for (const col of columnsToCompare) {
        const oldVal = oldRecord[col] ?? null;
        const newVal = newRecord[col] ?? null;
        if (oldVal !== newVal) {
          hasChanges = true;
          campos[col] = {
            de: oldVal,
            para: oldVal && !newVal ? "Registro Apagado" : newVal,
          };
        }
      }
      if (hasChanges) changes.push({ chave, tipo: "alterado", campos });
    }

    return {
      stats: {
        totalChavesOld: mapOld.size,
        totalChavesNew: mapNew.size,
        changedRows: changes.filter((c) => c.tipo === "alterado").length,
        deletedRows: changes.filter((c) => c.tipo === "apagado").length,
        newRows: changes.filter((c) => c.tipo === "novo").length,
        missingColumns,
      },
      changes,
    };
  }
}

export default UtilitariosService;
