// src/components/Aside.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AsideProps {
  children: React.ReactNode;
}

const Aside: React.FC<AsideProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-80% text-white",
        "bg-gray-900 backdrop-blur-sm",
        "hover:shadow-2xl",
        "rounded-xl shadow-2xl hover:shadow-md",
        "hover:backdrop-blur-none",
        "transition-all duration-300 ease-in-out",
        "opacity-10",
        isCollapsed ? "w-16" : "w-48 opacity-100",
        "ml-4 my-4 flex-shrink-0"
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
            transition: "all 300ms ease-in-out",
            opacity: isCollapsed ? 0 : 1,
            pointerEvents: isCollapsed ? "none" : "auto",
            justifyItems: "center",
          }}
        >
          <h2 className="text-xl font-semibold mb-4 whitespace-nowrap">
            Menu Principal
          </h2>
          <div className="space-y-2">{children}</div>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
