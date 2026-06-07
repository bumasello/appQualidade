import Equipes from "@/components/cards/EquipesCard";
import Usuarios from "@/components/cards/UsuariosCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type React from "react";

const Configuracoes: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Tabs defaultValue="equipes">
        <TabsList className="bg-gray-900 border border-gray-700 w-full">
          <TabsTrigger
            value="equipes"
            className="transition-colors duration-200 flex-1 cursor-pointer text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Equipes & Permissões
          </TabsTrigger>
          <TabsTrigger
            value="usuarios"
            className="transition-colors duration-200 flex-1 cursor-pointer text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Usuários
          </TabsTrigger>
        </TabsList>
        <TabsContent value="usuarios" className="animate-fade-in">
          <Usuarios />
        </TabsContent>
        <TabsContent value="equipes" className="animate-fade-in">
          <Equipes />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
