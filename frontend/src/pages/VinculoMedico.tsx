// src/pages/VinculoMedicoPage.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Importa o Input do Shadcn UI
import { Label } from "@/components/ui/label"; // Importa o Label do Shadcn UI
import { Button } from "@/components/ui/button"; // Importa o Button do Shadcn UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importa o Card do Shadcn UI

const VinculoMedicoPage: React.FC = () => {
  // Estados para os campos do formulário
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [cpf, setCpf] = useState(""); // Para o campo de CPF no segundo estado

  // Estados para as informações do médico (retornadas pelo backend)
  const [nomeMedico, setNomeMedico] = useState("");
  const [cpfVinculado, setCpfVinculado] = useState(""); // CPF já vinculado, se houver

  // Estado para controlar o modo do card: 'search' ou 'display'
  const [cardMode, setCardMode] = useState<"search" | "display">("search");

  // Função para simular a busca do médico (substituirá o fetch real)
  const handleBuscarMedico = () => {
    // Simulação de fetch:
    console.log(`Buscando médico com CRM: ${crm} e UF: ${uf}`);
    // Aqui você faria o fetch para o backend.
    // Exemplo: fetch('/api/medico', { method: 'POST', body: JSON.stringify({ crm, uf }) })
    // .then(res => res.json())
    // .then(data => {
    //   setNomeMedico(data.nome);
    //   setCpfVinculado(data.cpf || ''); // Pode vir vazio
    //   setCardMode('display');
    // });

    // Simulação de dados retornados:
    setTimeout(() => {
      setNomeMedico("Dr. João da Silva");
      setCpfVinculado("123.456.789-00"); // Simula um CPF já vinculado
      // setCpfVinculado(''); // Simula nenhum CPF vinculado
      setCardMode("display");
    }, 1000);
  };

  // Função para simular o vínculo do médico (substituirá o fetch POST real)
  const handleRealizarVinculo = () => {
    console.log(`Realizando vínculo para CRM: ${crm}, UF: ${uf}, CPF: ${cpf}`);
    // Aqui você faria o fetch POST para o backend.
    // Exemplo: fetch('/api/vincular', { method: 'POST', body: JSON.stringify({ crm, uf, cpf }) })
    // .then(res => res.json())
    // .then(data => {
    //   alert('Vínculo realizado com sucesso!');
    //   // Opcional: Voltar para o modo de busca ou atualizar o estado
    //   setCardMode('search');
    //   setCrm('');
    //   setUf('');
    //   setCpf('');
    //   setNomeMedico('');
    //   setCpfVinculado('');
    // });

    alert("Vínculo realizado com sucesso! (Simulado)");
    setCardMode("search"); // Volta para o modo de busca
    setCrm("");
    setUf("");
    setCpf("");
    setNomeMedico("");
    setCpfVinculado("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {" "}
      {/* REMOVIDO: transition-opacity ease-in duration-500 */}
      <Card className="transition-all ease-in-out duration-300 w-full max-w-md p-6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        {" "}
        {/* Card principal com estilo do aside */}
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
                  className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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
                  className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
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
                    className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {cardMode === "search" ? (
            <Button
              onClick={handleBuscarMedico}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Buscar Médico
            </Button>
          ) : (
            <Button
              onClick={handleRealizarVinculo}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!!cpfVinculado}
            >
              {cpfVinculado ? "CPF Já Vinculado" : "Realizar Vínculo Médico"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VinculoMedicoPage;
