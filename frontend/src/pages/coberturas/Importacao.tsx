import CriarImportacao from "@/components/cards/CriarImportacao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type React from "react";

const Importacao: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white">Importação</h1>

      <Tabs defaultValue="criacao">
        <TabsList className="bg-gray-900 border border-gray-700 w-full">
          <TabsTrigger
            value="criacao"
            className="transition-colors duration-200 flex-1 cursor-pointer text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Criar Importação
          </TabsTrigger>
          <TabsTrigger
            value="pendencias"
            className="transition-colors duration-200 flex-1 cursor-pointer text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pendências
          </TabsTrigger>
        </TabsList>
        <TabsContent value="criacao" className="animate-fade-in">
          <CriarImportacao />
        </TabsContent>
        <TabsContent value="pendencias" className="animate-fade-in">
          Pendências
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Importacao;
