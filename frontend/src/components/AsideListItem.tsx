import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { AsideListItemContent } from "./AsideListItemContent";

import type { AutomationKey } from "@/App";
import type { SubItem } from "@/types/navigation";
import type { LucideIcon } from "lucide-react";

interface AsideListItemProps {
  icon: LucideIcon;
  label: string;
  onSelectAutomation: (key: AutomationKey) => void;
  selectedAutomation: AutomationKey;
  isCollapsed: boolean;
  accordionContent?: React.ReactNode;
  accordionValue: string;
  currentAccordionValue: string;
  onAccordionValueChange?: (value: string) => void;
  subItems: SubItem[];
}

export const AsideListItem: React.FC<AsideListItemProps> = ({
  icon: Icon,
  label,
  selectedAutomation,
  isCollapsed,
  onSelectAutomation,
  accordionValue,
  onAccordionValueChange,
  subItems,
  currentAccordionValue,
}) => {
  const isAccordionParentSelected = subItems.some(
    (key) => selectedAutomation === key.automationKey,
  );

  return (
    <div className="flex items-center w-full p-2 rounded-xl">
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          isCollapsed && isAccordionParentSelected && "text-blue-400",
        )}
      />
      <div
        className={cn(
          "w-full ml-2 overflow-hidden transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <Accordion
          type="single"
          collapsible
          value={isCollapsed ? "" : currentAccordionValue}
          onValueChange={onAccordionValueChange}
          className="w-full"
        >
          <AccordionItem value={accordionValue}>
            <AccordionTrigger
              className={cn(
                "flex items-center justify-between w-full p-2 rounded-xl cursor-pointer transition-colors duration-300",
                isAccordionParentSelected ? "bg-gray-700" : "",
              )}
            >
              <span className="whitespace-nowrap">{label}</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 mt-2">
              {subItems.map((item) => (
                <AsideListItemContent
                  key={item.automationKey}
                  label={item.label}
                  automationKey={item.automationKey}
                  onSelectAutomation={onSelectAutomation}
                  selectedAutomation={selectedAutomation}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
