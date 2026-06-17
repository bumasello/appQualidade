import { useAuth } from "@/contexts/AuthContext";
import { Loader2, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const API = "http://localhost:8080";

const CriarImportacao: React.FC = () => {
  const { auth } = useAuth();
  const [tipo_importacao, set_tipo_importacao] = useState("");
  const [nome_arquivo, set_nome_arquivo] = useState("");
  const [ticket, set_ticket] = useState("");
  const [obs, set_obs] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [file_input, set_file_input] = useState<File | null>(null);
  const [file_input_key, set_file_input_key] = useState(0);

  const handleRemoveFileOld = () => {
    set_file_input(null);
    set_file_input_key((k) => k + 1);
  };
  const resetForm = () => {
    set_nome_arquivo("");
    set_obs("");
    set_ticket("");
    set_tipo_importacao("");
    handleRemoveFileOld();
  };

  const handle_post_backend = async () => {
    try {
      if (!file_input || !nome_arquivo || !tipo_importacao || !ticket) {
        toast.error(
          "Os campos Planilha, Tipo Importação, Nome Arquivo e Ticket são obrigatórios!",
        );
        return;
      }
      set_is_loading(true);

      const formData = new FormData();

      formData.append("file_input", file_input);
      formData.append("nome_arquivo", nome_arquivo);
      formData.append("tipo_importacao", tipo_importacao);
      formData.append("ticket", ticket);
      formData.append("obs", obs || "");

      const res = await fetch(`${API}/coberturas/cria_cobertura`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Erro ao criar importação!");
      }

      toast.success("Importação agendada!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar importação!",
      );
    } finally {
      resetForm();
      set_is_loading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full p8">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-2xl p6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Importação</CardTitle>
          <CardDescription className="text-gray-400">
            Permite importar uma PPP ou CICOM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Selecione uma planilha</Label>
            <div className="flex gap-2">
              <Input
                key={file_input_key}
                id="file"
                type="file"
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg hover:cursor-pointer"
                onChange={(e) => set_file_input(e.target.files?.[0] ?? null)}
              />
              {file_input && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFileOld}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tipo Importação</Label>
              <Select
                value={tipo_importacao}
                onValueChange={set_tipo_importacao}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="CICOM | PPP" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="PPP" className="cursor-pointer">
                    PPP
                  </SelectItem>
                  <SelectItem value="CICOM" className="cursor-pointer">
                    CICOM
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_arquivo">Nome Arquivo</Label>
              <Input
                id="nome_arquivo"
                type="text"
                placeholder="Ex: 12345"
                value={nome_arquivo}
                onChange={(e) => set_nome_arquivo(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket">Ticket</Label>
              <Input
                id="ticket"
                type="text"
                placeholder="Ex: 12345"
                value={ticket}
                onChange={(e) => set_ticket(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observação</Label>
              <Input
                id="obs"
                type="text"
                placeholder="Ex: 12345"
                value={obs}
                onChange={(e) => set_obs(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-between w-full gap-4">
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Limpar
            </Button>
            <Button
              onClick={handle_post_backend}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={is_loading}
            >
              {is_loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Criar Importação"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CriarImportacao;
