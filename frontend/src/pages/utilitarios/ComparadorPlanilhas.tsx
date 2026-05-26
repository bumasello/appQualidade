import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import type React from "react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ComparadorResult {
  stats: {
    changedRows: number;
    deletedRows: number;
    newRows: number;
    missingColumns: string[];
  };
  changes: {
    chave: string;
    tipo: string;
    campos: Record<string, { de: string | null; para: string | null }>;
  }[];
}

const ComparadorPlanilhas: React.FC = () => {
  const [fileOld, setFileOld] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [fileNew, setFileNew] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFileOld, setIsLoadingFileOld] = useState(false);
  const [fileOldKey, setFileOldKey] = useState(0);
  const [fileNewKey, setFileNewKey] = useState(0);
  const { auth } = useAuth();

  const readColumns = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          if (!sheet) {
            resolve([]);
            return;
          }
          const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
          });
          const rawHeaders = (rows[0] ?? []) as unknown[];
          const cols = rawHeaders
            .map((h) => (h == null ? "" : String(h).trim()))
            .filter((h) => h && h.toUpperCase() !== "CHAVE");
          resolve(cols);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileOld = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoadingFileOld(true);
    const file = e.target.files?.[0] ?? null;
    setFileOld(file);
    setColumns([]);
    setSelectedColumns([]);
    if (file) {
      try {
        const cols = await readColumns(file);
        if (cols.length === 0) {
          toast.warning(
            "Nenhuma coluna encontrada na primeira linha do arquivo.",
          );
        }
        setColumns(cols);
      } catch (err) {
        toast.error(
          `Erro ao ler arquivo: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    setIsLoadingFileOld(false);
  };

  const handleRemoveFileOld = () => {
    setFileOld(null);
    setColumns([]);
    setSelectedColumns([]);
    setFileOldKey((k) => k + 1);
  };
  const handleRemoveFileNew = () => {
    setFileNew(null);
    setFileNewKey((k) => k + 1);
  };

  const handlePostBackend = async () => {
    if (!fileOld || !fileNew) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fileOld", fileOld);
      formData.append("fileNew", fileNew);
      formData.append("selectedColumns", JSON.stringify(selectedColumns));

      const res = await fetch(
        "http://localhost:8080/utilitarios/comparador-planilhas",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Erro ao comparar planilhas!");
      }

      handleExport(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao comprar planilhas!",
      );
    } finally {
      handleRemoveFileOld();
      handleRemoveFileNew();
      setIsLoading(false);
    }
  };

  const handleExport = (data: ComparadorResult) => {
    if (!data) return;

    try {
      const colmunsToExport = selectedColumns.filter(
        (col) => !data.stats.missingColumns.includes(col),
      );

      const headers = ["CHAVE", ...colmunsToExport];
      const rows = data.changes.map((change) => {
        const row: (string | null)[] = [change.chave];
        for (const col of colmunsToExport) {
          const diff = change.campos[col];
          row.push(diff ? diff.para : null);
        }
        return row;
      });

      const resumoData = [
        ["Resumo da Comparação"],
        [],
        ["Total de alterações", data.stats.changedRows],
        ["Registros novos", data.stats.newRows],
        ["Registros apagados", data.stats.deletedRows],
        [],
        ["Colunas ausentes no arquivo novo (não comparadas)"],
        ...data.stats.missingColumns.map((col) => [col]),
      ];
      const wsResultado = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
      XLSX.utils.book_append_sheet(wb, wsResultado, "Resultado");
      XLSX.writeFile(wb, "resultado_comparacao.xlsx");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao gerar planilha resultado!",
      );
    } finally {
      toast.success(
        `Exportado com sucesso! ${data.stats.changedRows + data.stats.newRows + data.stats.deletedRows} alterações.`,
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p8">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-2xl p6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Comparador de Planilhas
          </CardTitle>
          <CardDescription className="text-gray-400">
            Faça o upload de duas planilhas para compara-las
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-old">Arquivo Antigo</Label>
            <div className="flex gap-2">
              <Input
                key={fileOldKey}
                id="file-old"
                type="file"
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg hover:cursor-pointer"
                onChange={handleFileOld}
              />
              {fileOld &&
                (isLoadingFileOld ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFileOld}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ))}
            </div>
          </div>
          {columns.length > 0 && (
            <div className="space-y-2">
              <Label>Colunas para comparar</Label>
              <div
                className="grid grid-cols-2 gap-2 pr-1"
                style={{ maxHeight: "128px", overflowY: "scroll" }}
              >
                {columns.map((col, idx) => (
                  <div
                    key={`${col}-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={col}
                      checked={selectedColumns.includes(col)}
                      onCheckedChange={(checked) => {
                        setSelectedColumns((prev) =>
                          checked
                            ? [...prev, col]
                            : prev.filter((c) => c !== col),
                        );
                      }}
                    />
                    <Label
                      htmlFor={col}
                      className="cursor-pointer font-normal text-sm"
                    >
                      {col}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="file-new">Arquivo Novo</Label>
            <div className="flex gap-2">
              <Input
                key={fileNewKey}
                id="file-new"
                type="file"
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg hover:cursor-pointer"
                onChange={(e) => setFileNew(e.target.files?.[0] ?? null)}
                disabled={selectedColumns.length === 0}
              />
              {fileOld && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFileNew}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full border-gray-700 hover:bg-gray-700 hover:border-gray-400 "
            disabled={
              !fileOld || !fileNew || selectedColumns.length === 0 || isLoading
            }
            onClick={handlePostBackend}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Comparar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ComparadorPlanilhas;
