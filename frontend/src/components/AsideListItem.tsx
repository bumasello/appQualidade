import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AsideListItemContent } from "./AsideListItemContent";

import type { AutomationKey } from "@/App";
import type { LucideIcon } from "lucide-react";
import type { SubItem } from "@/types/navigation";

interface AsideListItemProps {
  icon: LucideIcon;
  label: string;
  onSelectAutomation: (key: AutomationKey) => void;
  selectedAutomation: AutomationKey;
  isCollapsed: boolean;
  accordionContent?: React.ReactNode;
  accordionValue: string;
  currentAccordionValue: string | undefined;
  onAccordionValueChange?: (value: string | undefined) => void;
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
    <div
      className={cn(
        "flex items-center w-full p-2 rounded-xl transition-all duration-300 ease-in-out",
        isCollapsed && isAccordionParentSelected
          ? "bg-blue-600 text-white"
          : "",
        isCollapsed && "cursor-default",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <Accordion
          type="single"
          collapsible
          value={currentAccordionValue}
          onValueChange={onAccordionValueChange}
          className="w-full ml-2"
        >
          <AccordionItem value={accordionValue}>
            <AccordionTrigger
              className={cn(
                "flex items-center justify-between w-full p-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
                !isCollapsed && isAccordionParentSelected ? "bg-gray-700" : "",
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
      )}
    </div>
  );
};
