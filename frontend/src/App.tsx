// src/App.tsx
import React, { useState } from "react";
import Aside from "./components/Aside";
import redeDorLogo from "./assets/RDOR3.SA_BIG.png";

import VinculoMedicoPage from "./pages/VinculoMedico"; // Certifique-se que o nome do arquivo está correto

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
          // REMOVIDO: flex flex-col items-center justify-center h-full
          <div className="flex flex-col items-center justify-center">
            {" "}
            {/* Apenas o flex para o conteúdo interno */}
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
        // VinculoMedicoPage já tem suas próprias classes de centralização
        return <VinculoMedicoPage />;
      case "dashboard":
        return (
          // REMOVIDO: flex flex-col items-center justify-center h-full
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
        );
      case "configuracoes":
        return (
          // REMOVIDO: flex flex-col items-center justify-center h-full
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
          </div>
        );
      case "relatorios":
        return (
          // REMOVIDO: flex flex-col items-center justify-center h-full
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          </div>
        );
      default:
        return (
          // REMOVIDO: flex flex-col items-center justify-center h-full
          <div className="flex flex-col items-center justify-center">
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
          {/* NOVO: Adicionado flex flex-col items-center justify-center h-full aqui */}
          <div
            key={selectedAutomation}
            className="animate-fade-in flex flex-col items-center justify-center h-full"
          >
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
