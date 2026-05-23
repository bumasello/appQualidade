// src/components/Aside.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  FileUser,
  TestTube,
  Hammer,
} from "lucide-react";

import { AsideListItem } from "./AsideListItem";
import {
  pacienteSubItems,
  prfSaudeSubItems,
  testSubItems,
  utilitariosSubItems,
} from "@/config/asideNavigation";

import type { AutomationKey } from "../App";

interface AsideProps {
  onSelectAutomation: (key: AutomationKey) => void;
  selectedAutomation: AutomationKey;
}

const Aside: React.FC<AsideProps> = ({
  onSelectAutomation,
  selectedAutomation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openAccordionItem, setOpenAccordionItem] = useState<string>("");

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // if (!isCollapsed) {
    //   setOpenAccordionItem(undefined);
    // }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-80% text-white",
        "bg-gray-900 backdrop-blur-sm",
        "rounded-xl shadow-2xl",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-52",
        "ml-4 my-4 flex-shrink-0",
        "hover:shadow-none",
      )}
    >
      {/* Botão de Toggle */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleCollapse}
          className="rounded-full bg-gray-900 hover:bg-blue-600 shadow-lg ring-1 ring-white"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        {!isCollapsed && (
          <h2 className="text-xl text-center font-semibold mb-4 whitespace-nowrap">
            Menu Principal
          </h2>
        )}

        {/* Todos os itens agrupados para uniformizar espaçamento */}
        <nav className="space-y-2 mb-4">
          {/* Item de Profissionais de Saúde */}
          <AsideListItem
            icon={Stethoscope}
            label="Prf Saúde"
            onSelectAutomation={onSelectAutomation}
            selectedAutomation={selectedAutomation}
            isCollapsed={isCollapsed}
            accordionValue="item-prf-saude"
            currentAccordionValue={openAccordionItem}
            onAccordionValueChange={setOpenAccordionItem}
            subItems={prfSaudeSubItems}
          />
          {/* Item Pacientes */}
          <AsideListItem
            icon={FileUser}
            label="Pacientes"
            onSelectAutomation={onSelectAutomation}
            selectedAutomation={selectedAutomation}
            isCollapsed={isCollapsed}
            accordionValue="item-pacientes"
            currentAccordionValue={openAccordionItem}
            onAccordionValueChange={setOpenAccordionItem}
            subItems={pacienteSubItems}
          />
          <AsideListItem
            icon={Hammer}
            label="Utilitários"
            onSelectAutomation={onSelectAutomation}
            selectedAutomation={selectedAutomation}
            isCollapsed={isCollapsed}
            accordionValue="item-utilitario"
            currentAccordionValue={openAccordionItem}
            onAccordionValueChange={setOpenAccordionItem}
            subItems={utilitariosSubItems}
          ></AsideListItem>
          {/* Item Teste */}
          <AsideListItem
            icon={TestTube}
            label="Teste"
            onSelectAutomation={onSelectAutomation}
            selectedAutomation={selectedAutomation}
            isCollapsed={isCollapsed}
            accordionValue="item-teste"
            currentAccordionValue={openAccordionItem}
            onAccordionValueChange={setOpenAccordionItem}
            subItems={testSubItems}
          ></AsideListItem>
        </nav>
      </div>
    </aside>
  );
};

export default Aside;
