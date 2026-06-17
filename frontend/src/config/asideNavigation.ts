import type { SubItem } from "@/types/navigation";
import { Grid2x2, Hammer, Stethoscope, type LucideIcon } from "lucide-react";

export interface MenuGroup {
  label: string;
  icon: LucideIcon;
  accordion_value: string;
  sub_items: SubItem[];
}

export const prfSaudeSubItems: SubItem[] = [
  { label: "Vínculo Prf.", automationKey: "vinculo-profissional" },
  { label: "Repl. Curriculo Onco", automationKey: "repl-curriculo-prf" },
];

export const pacienteSubItems: SubItem[] = [
  { label: "Curadoria", automationKey: "curadoria-pacientes" },
];

export const utilitariosSubItems: SubItem[] = [
  { label: "Comparador de Planilhas", automationKey: "comparador-planilhas" },
];

export const cobertura_subitems: SubItem[] = [
  { label: "Importação PPP", automationKey: "importacao-ppp" },
];

export const testSubItems: SubItem[] = [
  { label: "Sub-item Teste", automationKey: "teste" },
];

export const menu_group: MenuGroup[] = [
  {
    label: "Prf. Saúde",
    icon: Stethoscope,
    accordion_value: "item-prf-saude",
    sub_items: prfSaudeSubItems,
  },
  {
    label: "Utilitários",
    icon: Hammer,
    accordion_value: "item-utilitario",
    sub_items: utilitariosSubItems,
  },
  {
    label: "Coberturas",
    icon: Grid2x2,
    accordion_value: "item-cobertura",
    sub_items: cobertura_subitems,
  },
];
