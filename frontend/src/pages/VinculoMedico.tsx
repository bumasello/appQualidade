// src/pages/VinculoMedicoPage.tsx
import React, { useState } from "react";
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
import { toast } from "sonner"; // Importe a função toast

const VinculoMedicoPage: React.FC = () => {
  // ... (estados e funções permanecem os mesmos)
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [cpf, setCpf] = useState("");
  const [nomeMedico, setNomeMedico] = useState("");
  const [cpfVinculado, setCpfVinculado] = useState("");
  const [cardMode, setCardMode] = useState<"search" | "display">("search");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCrm("");
    setUf("");
    setCpf("");
    setNomeMedico("");
    setCpfVinculado("");
    setCardMode("search");
  };

  const handleBuscarMedico = () => {
    if (!crm || !uf) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, preencha o CRM e a UF.",
      });
      return;
    }

    setIsLoading(true);
    console.log(`Buscando médico com CRM: ${crm} e UF: ${uf}`);
    setTimeout(() => {
      setNomeMedico("Dr. João da Silva");
      // setCpfVinculado("123.456.789-00");
      setCardMode("display");
      setIsLoading(false);
    }, 1000);
  };

  const handleRealizarVinculo = () => {
    if (!cpfVinculado && !cpf) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, informe o CPF para vincular.",
      });
      return;
    }

    console.log(
      `Realizando vínculo para CRM: ${crm}, UF: ${uf}, CPF: ${cpfVinculado || cpf}`,
    );

    // Substitua o alert() por toast.success()
    toast.success("Vínculo Realizado!", {
      description: `O médico ${nomeMedico} foi vinculado ao CPF ${cpfVinculado || cpf}.`,
      duration: 3000, // A notificação desaparecerá após 3 segundos
    });

    resetForm();
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
        <CardFooter className="flex justify-between gap-4">
          {cardMode === "search" ? (
            <>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                disabled={isLoading}
              >
                Limpar
              </Button>
              <Button
                onClick={handleBuscarMedico}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
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
