// src/components/Aside.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Removido ChevronDown, ChevronUp pois AccordionTrigger já tem
import { cn } from "@/lib/utils";

// Remova os imports de Collapsible
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Importe os componentes do Accordion
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  // O Accordion gerencia seu próprio estado de abertura/fechamento.
  // Usamos 'single' para que apenas um item esteja aberto por vez.
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >(undefined); // Estado para controlar qual item do accordion está aberto

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Ao colapsar o aside, feche qualquer item do accordion que esteja aberto
    if (!isCollapsed) {
      setOpenAccordionItem(undefined);
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-80% text-white",
        "bg-gray-900 backdrop-blur-sm",
        "rounded-xl shadow-2xl", // Sombra padrão visível quando não há hover
        "transition-all duration-300 ease-in-out", // Garante transição suave para todas as propriedades, incluindo a sombra
        isCollapsed ? "w-16" : "w-48",
        "ml-4 my-4 flex-shrink-0",
        "hover:shadow-none", // A sombra desaparece ao passar o mouse
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
          className="rounded-full"
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
            transition: "all 300ms ease-in-out",
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
                  : "hover:bg-gray-700",
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
                  : "hover:bg-gray-700",
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
                  : "hover:bg-gray-700",
              )}
            >
              Relatórios
            </a>
          </nav>

          {/* Contexto: Médicos (Accordion) */}
          <Accordion
            type="single" // Permite que apenas um item do accordion esteja aberto por vez
            collapsible // Permite que o item aberto seja fechado ao clicar novamente no seu trigger
            value={openAccordionItem} // Controla qual item está aberto
            onValueChange={setOpenAccordionItem} // Atualiza o estado quando um item é aberto/fechado
            className="w-full" // Accordion ocupa a largura total disponível
          >
            <AccordionItem value="item-medicos">
              {" "}
              {/* Cada item do accordion precisa de um valor único */}
              <AccordionTrigger className="flex items-center justify-between p-2 rounded-xl mx-2 cursor-pointer hover:bg-gray-700 transition-all duration-300 ease-in-out">
                <span className="font-medium whitespace-nowrap">Médicos</span>
                {/* O AccordionTrigger já adiciona um ícone de seta por padrão, não precisa de ChevronDown/Up aqui */}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 mt-2 pl-6">
                <a
                  href="#"
                  onClick={() => onSelectAutomation("vinculo-medico")}
                  className={cn(
                    "block p-2 rounded-xl whitespace-nowrap",
                    selectedAutomation === "vinculo-medico"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700",
                  )}
                >
                  Vínculo Médico
                </a>
                {/* Adicione outras automações de Médicos aqui */}
              </AccordionContent>
            </AccordionItem>

            {/* Exemplo de outro item do Accordion (Pacientes) */}
            {/*
            <AccordionItem value="item-pacientes">
              <AccordionTrigger className="flex items-center justify-between p-2 rounded-xl mx-2 cursor-pointer hover:bg-gray-700 transition-all duration-300 ease-in-out">
                <span className="font-medium whitespace-nowrap">Pacientes</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pl-6">
                <a
                  href="#"
                  onClick={() => onSelectAutomation("cadastrar-paciente")}
                  className={cn(
                    "block p-2 rounded-xl whitespace-nowrap",
                    selectedAutomation === "cadastrar-paciente" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                  )}
                >
                  Cadastrar Paciente
                </a>
              </AccordionContent>
            </AccordionItem>
            */}
          </Accordion>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
