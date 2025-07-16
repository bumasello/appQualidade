// src/components/ui/MultiSelectCombobox.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
  maxDisplayedBadges?: number; // NOVO: Prop para definir o máximo de badges
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Selecione as opções...",
  maxDisplayedBadges = 3, // NOVO: Valor padrão de 3
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "bg-gray-800 border-gray-700 w-full justify-between h-10",
          )} // Altura fixa para consistência
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap items-center">
            {/* LÓGICA DE RENDERIZAÇÃO */}
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selected.length <= maxDisplayedBadges ? (
              selected.map((item) => {
                const option = options.find((opt) => opt.value === item);
                return (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {option ? option.label : item}
                    <X
                      className="ml-1 h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    />
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm">
                {selected.length} opções selecionadas
              </span>
            )}
          </div>
          <div className="p-1 rounded-full transition-all ease-in-out duration-300 hover:bg-gray-700">
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 " />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0")}>
        <Command className={className}>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.value)
                        ? selected.filter((item) => item !== option.value)
                        : [...selected, option.value],
                    );
                    setOpen(true);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
