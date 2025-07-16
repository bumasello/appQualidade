// src/components/ui/DatePicker.tsx
import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  placeholder?: string;
}

export function DatePicker({ placeholder }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>();
  const [inputValue, setInputValue] = React.useState("");

  // Função para formatar e validar a entrada de data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove não-dígitos

    // Adiciona a primeira barra
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    // Adiciona a segunda barra
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5)}`;
    }

    // Limita o comprimento total a 10 caracteres (dd/MM/yyyy)
    value = value.slice(0, 10);

    setInputValue(value);

    // Tenta parsear e atualizar a data principal se o formato estiver completo
    if (value.length === 10) {
      const parsedDate = parse(value, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    } else {
      setDate(undefined);
    }
  };
  // Efeito para atualizar o input quando a data é selecionada no calendário
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            // --- Estilos Base ---
            "w-full justify-start text-left font-normal",
            "bg-gray-800 border-transparent", // Fundo cinza, borda transparente por padrão
            "hover:bg-gray-800 border-gray-700", // Borda cinza sutil no hover
            // --- Estilos de Foco ---
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
            // --- Estilo quando não há data ---
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-1 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy")
          ) : (
            <span>{placeholder || "Selecione uma data"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p1">
        <div className="p-3 space-y-2">
          <Label htmlFor="date-input">Entrada Manual</Label>
          <Input
            id="date-input"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="dd/mm/aaaa"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
