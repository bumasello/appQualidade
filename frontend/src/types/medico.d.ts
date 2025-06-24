// src/types/medico.d.ts

export interface MedicoData {
  NOME: string;
  CRM: string;
  UF: string;
  CPF: string | null; // CPF pode ser string ou null
}

export interface MedicoApiResponse {
  message: string;
  data: MedicoData;
}
