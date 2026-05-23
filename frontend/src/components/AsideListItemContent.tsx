import { cn } from "@/lib/utils";

import type { AutomationKey } from "@/App";

interface AsideListItemContentProps {
  label: string;
  automationKey: AutomationKey;
  onSelectAutomation: (key: AutomationKey) => void;
  selectedAutomation: AutomationKey;
}

export const AsideListItemContent: React.FC<AsideListItemContentProps> = ({
  label,
  automationKey,
  onSelectAutomation,
  selectedAutomation,
}) => {
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectAutomation(automationKey)}
        onKeyDown={(e) =>
          e.key === "Enter" && onSelectAutomation(automationKey)
        }
        className={cn(
          "block p-2 rounded-xl",
          selectedAutomation === automationKey
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-700",
        )}
      >
        {label}
      </div>
    </div>
  );
};
