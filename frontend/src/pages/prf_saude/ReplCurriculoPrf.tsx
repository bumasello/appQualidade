import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ReplCurriculoPrf: React.FC = () => {
  const { auth } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (erros.length > 0) {
      setErros([]);
    }
    const file = e.target.files?.[0] ?? null;

    setFile(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileKey((k) => k + 1);
  };

  const handlePostBackend = async () => {
    if (!file) return;
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "http://localhost:8080/prf_saude/replicar_curriculo",
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
        throw new Error(data.message ?? "Erro ao replicar currículo!");
      }
      console.log(data);
      if (data.erros > 0) {
        setErros(data.detalhes);
      }

      toast.success("Currículos replicados!", {
        description: `Total de linhas: ${data["total linhas"]}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao replicar currículos!",
      );
    } finally {
      handleRemoveFile();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p8">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-2xl p6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Replicar Curriculo Profissional
          </CardTitle>
          <CardDescription className="text-gray-400">
            Faça o upload de uma planilha para replicar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Planilha com currículos</Label>
            <div className="flex gap-2">
              <Input
                key={fileKey}
                id="file"
                type="file"
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg hover:cursor-pointer"
                onChange={handleFile}
              />
              {file && (
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {erros.length > 0 && (
            <div className="space-y-2">
              <Label>Replicado com {erros.length} erros</Label>
              <div
                className="rounded-lg bg-gray-800 border border-red-900 p-2 space-y-1"
                style={{ maxHeight: "160px", overflowY: "scroll" }}
              >
                {erros.map((e, idx) => (
                  <p key={idx} className="text-xs text-red-300 font-mono">
                    {e}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full border-gray-700 hover:bg-gray-700 hover:border-gray-400 "
            disabled={!file}
            onClick={handlePostBackend}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
            ) : (
              "Replicar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReplCurriculoPrf;
