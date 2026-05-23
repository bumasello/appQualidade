import { DatePicker } from "@/components/DatePicker";
import { MultiSelect, type OptionType } from "@/components/MultiSelectCombobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const FRAMEWORKS: OptionType[] = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "astro", label: "Astro" },
  { value: "vue", label: "Vue" },
  { value: "remix", label: "Remix" },
  { value: "angular", label: "Angular" },
  { value: "nomediferentedoserasa", label: "Nome diferente do Serasa" },
];

const FRAMEWORKS_nw: OptionType[] = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "astro", label: "Astro" },
  { value: "vue", label: "Vue" },
  { value: "remix", label: "Remix" },
  { value: "angular", label: "Angular" },
  { value: "nomediferentedoserasa", label: "Nome diferente do Serasa" },
];

const CuradoriaPacientes = () => {
  const [selectedMotivo, setSelectedMotivo] = useState<string[]>([]);
  const [selectedMarcacao, setSelectedMarcacao] = useState<string[]>([]);
  const [selecaoUnica, setSelecaoUnica] = useState<string>("Todos");

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-md bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Curadoria Pacientes
          </CardTitle>
          <CardDescription className="text-gray-400">
            Informe os filtros desejados para curadoria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Seção de Datas */}
          <div className="space-y-2 text-left">
            <Label>Período</Label>
            <div className="flex items-center gap-4">
              <DatePicker placeholder="Data Inicial" />
              <DatePicker placeholder="Data Final" />
            </div>
          </div>
          {/* Seção de Motivo Inválido */}
          <div className="space-y-2">
            <Label htmlFor="mtv-inv">Motivo Inválido</Label>
            <MultiSelect
              options={FRAMEWORKS}
              selected={selectedMotivo}
              onChange={setSelectedMotivo}
            />
          </div>
          {/* Seção de Marcação */}
          <div className="space-y-2">
            <Label htmlFor="mtv-inv">Marcação</Label>
            <MultiSelect
              options={FRAMEWORKS_nw}
              selected={selectedMarcacao}
              onChange={setSelectedMarcacao}
            />
          </div>
          <div className="space-y-2 text-left">
            <Label>Tratado</Label>
            <RadioGroup
              value={selecaoUnica}
              onValueChange={setSelecaoUnica}
              className="flex items-center space-x-4 pt-2" // Usar flex para alinhar horizontalmente
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="sim" />
                <Label htmlFor="sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="nao" />
                <Label htmlFor="nao">Não</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todos" id="todos" />
                <Label htmlFor="todos">Todos</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CuradoriaPacientes;
