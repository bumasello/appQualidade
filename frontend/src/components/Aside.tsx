// src/components/Aside.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AutomationKey } from "../App"; // Importe o tipo AutomationKey

interface AsideProps {
  onSelectAutomation: (key: AutomationKey) => void;
  selectedAutomation: AutomationKey;
}

const Aside: React.FC<AsideProps> = ({
  onSelectAutomation,
  selectedAutomation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMedicosOpen, setIsMedicosOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-80% text-white", // Corrigido de h-80% para h-full
        "bg-gray-900 backdrop-blur-sm",
        "rounded-xl shadow-2xl", // Sombra padrão mais forte
        "transition-all duration-300 ease-in-out", // Esta transição se aplica à largura
        isCollapsed ? "w-16" : "w-48",
        "ml-4 my-4 flex-shrink-0"
        // REMOVIDO: isCollapsed ? "opacity-10" : "opacity-100", // Removido para que o aside esteja sempre visível
      )}
    >
      {/* Botão de Toggle */}
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 -right-4 z-10
        `}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleCollapse}
          className="rounded-full shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Conteúdo do Aside */}
      <div className="flex-1 p-4 overflow-hidden">
        <div
          style={{
            transition: "all 300ms ease-in-out", // Esta transição é para a opacidade do CONTEÚDO
            opacity: isCollapsed ? 0 : 1,
            pointerEvents: isCollapsed ? "none" : "auto",
          }}
        >
          <h2 className="text-xl font-semibold mb-4 whitespace-nowrap">
            Menu Principal
          </h2>

          {/* Seção de Navegação Principal (Dashboard, Configurações, Relatórios) */}
          <nav className="space-y-2 mb-4">
            <a
              href="#"
              onClick={() => onSelectAutomation("dashboard")}
              className={cn(
                "transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2",
                selectedAutomation === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              )}
            >
              Dashboard
            </a>
            <a
              href="#"
              onClick={() => onSelectAutomation("configuracoes")}
              className={cn(
                "transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2",
                selectedAutomation === "configuracoes"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              )}
            >
              Configurações
            </a>
            <a
              href="#"
              onClick={() => onSelectAutomation("relatorios")}
              className={cn(
                "transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2",
                selectedAutomation === "relatorios"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              )}
            >
              Relatórios
            </a>
          </nav>

          {/* Contexto: Médicos (Collapsible) */}
          <Collapsible
            open={isMedicosOpen}
            onOpenChange={setIsMedicosOpen}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl mx-2 cursor-pointer",
                  "hover:bg-gray-700 transition-all duration-300 ease-in-out",
                  selectedAutomation === "vinculo-medico" ? "bg-gray-700" : ""
                )}
              >
                <span className="font-medium whitespace-nowrap">Médicos</span>
                {isMedicosOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pl-6">
              <a
                href="#"
                onClick={() => onSelectAutomation("vinculo-medico")}
                className={cn(
                  "block p-2 rounded-xl whitespace-nowrap",
                  selectedAutomation === "vinculo-medico"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700"
                )}
              >
                Vínculo Médico
              </a>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
