// src/App.tsx
import React, { useState } from "react"; // Importe useState
import Aside from "./components/Aside";
import redeDorLogo from "./assets/RDOR3.SA_BIG.png";

// Importe a página de vínculo médico
import VinculoMedicoPage from "./pages/VinculoMedico";

// Defina um tipo para as chaves de automação para melhor tipagem
export type AutomationKey =
  | "home"
  | "vinculo-medico"
  | "dashboard"
  | "configuracoes"
  | "relatorios"; // Adicione mais conforme necessário

function App() {
  // Estado para controlar qual automação está selecionada
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationKey>("home");

  // Função para renderizar o conteúdo principal com base na automação selecionada
  const renderMainContent = () => {
    switch (selectedAutomation) {
      case "home":
        return (
          <div className="flex flex-col items-center justify-center h-full">
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
        return <h1 className="text-3xl font-bold text-white">Dashboard</h1>;
      case "configuracoes":
        return <h1 className="text-3xl font-bold text-white">Configurações</h1>;
      case "relatorios":
        return <h1 className="text-3xl font-bold text-white">Relatórios</h1>;
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
    // 1. Div externa para o background completo da tela
    <div className="h-screen w-screen bg-gray-800">
      <div className="flex h-full items-stretch">
        {/* Passa a função de seleção e a automação selecionada para o Aside */}
        <Aside
          onSelectAutomation={setSelectedAutomation}
          selectedAutomation={selectedAutomation}
        />
        {/* O conteúdo de navegação (Dashboard, Configurações, Relatórios) será movido para dentro do Aside */}

        <main className="flex-1 p-8 text-white overflow-y-auto">
          {renderMainContent()} {/* Renderiza o conteúdo dinamicamente */}
        </main>
      </div>
    </div>
  );
}

export default App;
