// src/components/Aside.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  BarChart,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >(undefined);

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
          className="rounded-full shadow-lg"
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
          <h2 className="text-xl font-semibold mb-4 whitespace-nowrap">
            Menu Principal
          </h2>
        )}

        {/* Todos os itens agrupados para uniformizar espaçamento */}
        <nav className="space-y-2 mb-4">
          <a
            href="#"
            onClick={() => !isCollapsed && onSelectAutomation("dashboard")}
            className={cn(
              "flex items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
              selectedAutomation === "dashboard"
                ? "bg-blue-600 text-white"
                : !isCollapsed && "hover:bg-gray-700",
              isCollapsed && "cursor-default",
            )}
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "ml-3 whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "w-0 opacity-0 overflow-hidden"
                  : "w-auto opacity-100",
              )}
            >
              Dashboard
            </span>
          </a>

          <a
            href="#"
            onClick={() => !isCollapsed && onSelectAutomation("configuracoes")}
            className={cn(
              "flex items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
              selectedAutomation === "configuracoes"
                ? "bg-blue-600 text-white"
                : !isCollapsed && "hover:bg-gray-700",
              isCollapsed && "cursor-default",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "ml-3 whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "w-0 opacity-0 overflow-hidden"
                  : "w-auto opacity-100",
              )}
            >
              Configurações
            </span>
          </a>

          <a
            href="#"
            onClick={() => !isCollapsed && onSelectAutomation("relatorios")}
            className={cn(
              "flex items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
              selectedAutomation === "relatorios"
                ? "bg-blue-600 text-white"
                : !isCollapsed && "hover:bg-gray-700",
              isCollapsed && "cursor-default",
            )}
          >
            <BarChart className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "ml-3 whitespace-nowrap transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "w-0 opacity-0 overflow-hidden"
                  : "w-auto opacity-100",
              )}
            >
              Relatórios
            </span>
          </a>

          {/* Item Médicos — ícone sempre visível, label/accordion só quando expandido */}
          <div
            className={cn(
              "flex items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
              selectedAutomation === "vinculo-medico" && isCollapsed
                ? "bg-blue-600 text-white"
                : "",
              isCollapsed && "cursor-default",
            )}
          >
            <Stethoscope className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <Accordion
                type="single"
                collapsible
                value={openAccordionItem}
                onValueChange={setOpenAccordionItem}
                className="w-full ml-2"
              >
                <AccordionItem value="item-medicos">
                  <AccordionTrigger
                    className={cn(
                      "flex justify-between items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
                      "hover:bg-gray-700",
                    )}
                  >
                    <span className="whitespace-nowrap">Médicos</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    <a
                      href="#"
                      onClick={() =>
                        !isCollapsed && onSelectAutomation("vinculo-medico")
                      }
                      className={cn(
                        "block p-2 rounded-xl whitespace-nowrap",
                        selectedAutomation === "vinculo-medico"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-700",
                      )}
                    >
                      Vínculo Médico
                    </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Aside;
