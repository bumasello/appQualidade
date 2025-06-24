// src/App.tsx
import { useState } from "react";
import Aside from "./components/Aside";
import redeDorLogo from "./assets/RDOR3.SA_BIG.png";

import VinculoMedicoPage from "./pages/VinculoMedico";
import { Toaster } from "@/components/ui/sonner"; // Importe o Toaster

export type AutomationKey =
  | "home"
  | "vinculo-medico"
  | "dashboard"
  | "configuracoes"
  | "relatorios";

function App() {
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationKey>("home");

  const renderMainContent = () => {
    switch (selectedAutomation) {
      case "home":
        return (
          <div className="flex flex-col items-center justify-center">
            <img
              src={redeDorLogo}
              alt="Logo Rede D'Or São Luiz"
              className="max-w-full h-auto max-h-24 mb-4"
            />
            <h1 className="text-3xl font-bold text-white">
              Bem-vindo ao sistema!
            </h1>
            <p className="text-gray-400">
              Selecione uma opção no menu lateral.
            </p>
          </div>
        );
      case "vinculo-medico":
        return <VinculoMedicoPage />;
      case "dashboard":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
        );
      case "configuracoes":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
          </div>
        );
      case "relatorios":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-white">
              Página não encontrada
            </h1>
            <p className="text-gray-400">
              Selecione uma opção válida no menu lateral.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-800">
      <div className="flex h-full items-stretch">
        <Aside
          onSelectAutomation={setSelectedAutomation}
          selectedAutomation={selectedAutomation}
        />

        <main
          className={`
            flex-1 p-8 text-white overflow-y-auto
          `}
        >
          <div
            key={selectedAutomation}
            className="animate-fade-in flex flex-col items-center justify-center h-full"
          >
            {renderMainContent()}
          </div>
        </main>
      </div>
      <Toaster
        theme="dark" // Define o tema escuro
        className="toaster-custom-class" // Adiciona uma classe para estilos personalizados via CSS
        richColors // Adiciona cores ricas para diferentes tipos de toast (success, error, warning, info)
        position="bottom-right" // Posição do toast na tela
      />{" "}
      {/* Adicione o Toaster aqui, geralmente no final do App */}
    </div>
  );
}

export default App;
