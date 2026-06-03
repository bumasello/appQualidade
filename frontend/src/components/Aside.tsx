// src/components/Aside.tsx
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";

import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

import { menu_group } from "@/config/asideNavigation";
import { useAuth } from "@/contexts/AuthContext";
import type { AutomationKey } from "../App";
import { AsideListItem } from "./AsideListItem";

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
  const { auth } = useAuth();
  const telas = auth.telas;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
        {menu_group.map((group) => {
          const visiveis = group.sub_items.filter((s) =>
            telas.includes(s.automationKey),
          );
          if (visiveis.length === 0) return null;

          return (
            <AsideListItem
              key={group.accordion_value}
              icon={group.icon}
              label={group.label}
              accordionValue={group.accordion_value}
              subItems={visiveis}
              onSelectAutomation={onSelectAutomation}
              selectedAutomation={selectedAutomation}
              isCollapsed={isCollapsed}
              currentAccordionValue={openAccordionItem}
              onAccordionValueChange={setOpenAccordionItem}
            />
          );
        })}
      </div>
      {telas.includes("configuracoes") && (
        <div className="p-4 overflow-hidden">
          <button
            className={cn(
              "flex items-center w-full p-2 rounded-xl text-white cursor-pointer",
              "transition-all duration-300 ease-in-out hover:bg-gray-700",
              isCollapsed ? "justify-center" : "gap-2",
              selectedAutomation === "configuracoes" && "bg-gray-700",
            )}
            onClick={() => onSelectAutomation("configuracoes")}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Configurações</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Aside;
