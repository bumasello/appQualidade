// src/pages/VinculoMedicoPage.tsx
import React, { useState, useRef } from "react"; // Importe useRef
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { MedicoApiResponse } from "@/types/medico";

const VinculoMedicoPage: React.FC = () => {
  // Estados para os campos do formulário
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [cpf, setCpf] = useState("");

  // Estados para as informações do médico (retornadas pelo backend)
  const [nomeMedico, setNomeMedico] = useState("");
  const [cpfVinculado, setCpfVinculado] = useState("");

  // Estado para controlar o modo do card: 'search' ou 'display'
  const [cardMode, setCardMode] = useState<"search" | "display">("search");

  // Estado para controlar o carregamento do botão de busca
  const [isLoading, setIsLoading] = useState(false);

  // NOVO: Estado para controlar o carregamento do upload em lote
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  // NOVO: Ref para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  // NOVO: Estado para o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Função para resetar o formulário para o estado inicial de busca
  const resetForm = () => {
    setCrm("");
    setUf("");
    setCpf("");
    setNomeMedico("");
    setCpfVinculado("");
    setCardMode("search");
    setSelectedFile(null); // Limpa o arquivo selecionado também
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpa o valor do input de arquivo
    }
  };

  // Função para buscar o médico no backend
  const handleBuscarMedico = async () => {
    if (!crm || !uf) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, preencha o CRM e a UF.",
      });
      return;
    }

    setIsLoading(true);
    console.log(`Buscando médico com CRM: ${crm} e UF: ${uf}`);

    try {
      const response = await fetch(
        `http://localhost:8080/vinculomedico/buscar?crm=${crm}&uf=${uf}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Erro na busca", {
          description:
            errorData.message ||
            "Não foi possível encontrar o médico. Verifique o CRM e a UF.",
        });
        return;
      }

      const responseData: MedicoApiResponse = await response.json();

      setNomeMedico(responseData.data.NOME);
      setCpfVinculado(responseData.data.CPF || "");

      setCardMode("display");
      toast.success("Médico encontrado!", {
        description: `Nome: ${responseData.data.NOME}`,
      });
    } catch (error) {
      console.error("Erro ao buscar médico:", error);
      toast.error("Erro de conexão", {
        description:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para simular o vínculo do médico (substituirá o fetch POST real)
  const handleRealizarVinculo = () => {
    if (!cpfVinculado && !cpf) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, informe o CPF para vincular.",
      });
      return;
    }

    console.log(
      `Realizando vínculo para CRM: ${crm}, UF: ${uf}, CPF: ${
        cpfVinculado || cpf
      }`
    );

    toast.success("Vínculo Realizado!", {
      description: `O médico ${nomeMedico} foi vinculado ao CPF ${
        cpfVinculado || cpf
      }.`,
      duration: 3000,
    });
    resetForm();
  };

  // NOVO: Função para disparar o clique no input de arquivo oculto
  const handleBatchUploadClick = () => {
    fileInputRef.current?.click();
  };

  // NOVO: Função para lidar com a seleção do arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Aqui você pode adicionar uma validação inicial do arquivo (tamanho, tipo)
      console.log("Arquivo selecionado:", file.name);
      // Opcional: Chamar a função de upload imediatamente após a seleção
      handleUploadBatchFile(file);
    }
  };

  // NOVO: Função para simular o upload do arquivo em lote para o backend
  const handleUploadBatchFile = async (file: File) => {
    setIsBatchUploading(true);
    console.log(`Enviando arquivo ${file.name} para processamento em lote...`);

    // Simulação de upload para o backend
    // Você usaria FormData para enviar o arquivo:
    // const formData = new FormData();
    // formData.append('excelFile', file);
    // try {
    //   const response = await fetch('http://localhost:8080/vinculomedico/upload-lote', {
    //     method: 'POST',
    //     body: formData,
    //   } );
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     toast.error("Erro no upload", {
    //       description: errorData.message || "Não foi possível processar a planilha.",
    //     });
    //     return;
    //   }
    //   const successData = await response.json();
    //   toast.success("Upload em Lote Concluído!", {
    //     description: successData.message || `Planilha ${file.name} processada com sucesso.`,
    //     duration: 5000,
    //   });
    // } catch (error) {
    //   console.error("Erro ao enviar arquivo em lote:", error);
    //   toast.error("Erro de conexão", {
    //     description: "Não foi possível conectar ao servidor para upload em lote.",
    //   });
    // } finally {
    //   setIsBatchUploading(false);
    //   resetForm(); // Opcional: resetar o formulário após o upload
    // }

    // Simulação atual:
    setTimeout(() => {
      toast.success("Upload em Lote Concluído!", {
        description: `Planilha "${file.name}" processada com sucesso (simulado).`,
        duration: 5000,
      });
      setIsBatchUploading(false);
      resetForm(); // Reseta o formulário após o "upload"
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-md p-6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Vínculo Médico</CardTitle>
          <CardDescription className="text-gray-400">
            {cardMode === "search"
              ? "Informe o CRM e UF para buscar o médico."
              : "Confirme os dados e vincule o CPF."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cardMode === "search" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  type="text"
                  placeholder="Ex: 12345"
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  type="text"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Nome do Médico</Label>
                <p className="text-lg font-semibold text-blue-300">
                  {nomeMedico}
                </p>
              </div>
              <div className="space-y-2">
                <Label>CRM / UF</Label>
                <p className="text-lg font-semibold">
                  {crm} / {uf}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                {cpfVinculado ? (
                  <p className="text-lg font-semibold text-green-400">
                    {cpfVinculado} (Já Vinculado)
                  </p>
                ) : (
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="Informe o CPF para vincular"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {" "}
          {/* Alterado para flex-col */}
          {cardMode === "search" ? (
            <>
              <div className="flex justify-between w-full gap-4">
                {" "}
                {/* Novo div para manter os dois botões lado a lado */}
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  disabled={isLoading || isBatchUploading}
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleBuscarMedico}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isBatchUploading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Buscar Médico"
                  )}
                </Button>
              </div>
              {/* NOVO: Botão de Associação em Lotes */}
              <Button
                onClick={handleBatchUploadClick}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                disabled={isLoading || isBatchUploading}
              >
                {isBatchUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando Planilha...
                  </>
                ) : (
                  "Associação em Lotes (Excel)"
                )}
              </Button>
              {/* NOVO: Input de arquivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" // Oculta o input
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" // Aceita tipos de arquivo Excel
              />
            </>
          ) : (
            <>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Retornar
              </Button>
              <Button
                onClick={handleRealizarVinculo}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!!cpfVinculado}
              >
                {cpfVinculado ? "CPF Já Vinculado" : "Realizar Vínculo Médico"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VinculoMedicoPage;
