// src/App.tsx
import { useState } from "react";
import Aside from "./components/Aside";

import VinculoMedicoPage from "./pages/prf_saude/VinculoMedico";
import { Toaster } from "@/components/ui/sonner"; // Importe o Toaster
import CuradoriaPacientes from "./pages//pacientes/CuradoriaPacientes";
import LoginPage from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import ComparadorPlanilhas from "./pages/utilitarios/ComparadorPlanilhas";
import ReplCurriculoPrf from "./pages/prf_saude/ReplCurriculoPrf";

export type AutomationKey =
  | "home"
  | "login"
  | "vinculo-medico"
  | "curadoria-prf-saude"
  | "curadoria-pacientes"
  | "repl-curriculo-prf"
  | "configuracoes"
  | "relatorios"
  | "pacientes"
  | "comparador-planilhas"
  | "teste";

function App() {
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationKey>("login");

  const renderMainContent = () => {
    switch (selectedAutomation) {
      case "login":
        return (
          <LoginPage onLoginSucess={() => setSelectedAutomation("home")} />
        );
      case "home":
        return <Home />;
      case "vinculo-medico":
        return <VinculoMedicoPage />;
      case "repl-curriculo-prf":
        return <ReplCurriculoPrf />;
      case "curadoria-pacientes":
        return <CuradoriaPacientes />;
      case "comparador-planilhas":
        return <ComparadorPlanilhas />;
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
    <AuthProvider>
      <div className="h-screen w-screen bg-gray-800">
        <div className="flex h-full items-stretch">
          {selectedAutomation !== "login" ? (
            <Aside
              onSelectAutomation={setSelectedAutomation}
              selectedAutomation={selectedAutomation}
            />
          ) : (
            ""
          )}

          <main
            className={`
            flex-1 p-8 text-white overflow-y-auto
          `}
          >
            <div
              key={selectedAutomation}
              // className="animate-fade-in flex flex-col items-center justify-center h-full"
              className="animate-fade-in h-full"
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
      </div>
    </AuthProvider>
  );
}

export default App;
