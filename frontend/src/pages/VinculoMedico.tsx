// src/pages/VinculoMedicoPage.tsx
import React from "react";

const VinculoMedicoPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Vínculo Médico</h1>
      <p className="text-lg mb-6">Página para vincular CRM de médico a CPF.</p>

      {/* Placeholder para o formulário de vínculo */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md">
        <p className="text-gray-300">
          Aqui virá o formulário e a lógica para o vínculo de CRM a CPF.
        </p>
        {/* Você pode adicionar campos de input e botões aqui */}
      </div>
    </div>
  );
};

export default VinculoMedicoPage;
