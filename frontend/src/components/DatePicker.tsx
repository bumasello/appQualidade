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
    let value = e.target.value;

    // 1. Remove tudo que não for dígito
    value = value.replace(/\D/g, "");

    // 2. Adiciona as barras automaticamente
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5)}`;
    }

    // 3. Limita o comprimento total
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // 4. Atualiza o estado do input
    setInputValue(value);

    // 5. Tenta parsear e atualizar a data principal se o formato estiver completo
    if (value.length === 10) {
      const parsedDate = parse(value, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    } else {
      // Se o usuário está apagando, limpa a data selecionada
      setDate(undefined);
    }
  };

  // Efeito para atualizar o input quando a data é selecionada no calendário
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"));
    } else {
      // Se a data for limpa, limpa o input também
      setInputValue("");
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "bg-gray-800 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy")
          ) : (
            <span>{placeholder || "Selecione uma data"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4 space-y-2">
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
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
