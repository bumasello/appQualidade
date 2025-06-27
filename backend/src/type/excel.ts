// src/types/excel.ts

// Interface para a linha de dados do Excel após o processamento estrutural
// As chaves devem corresponder EXATAMENTE aos cabeçalhos da planilha Excel
export interface VinculoMedicoExcelRow {
  SISTEMA?: string | null;
  UNIDADE?: string | null;
  CONCAT?: string | null;
  ESTABELECIMENTO?: string | null;
  BIP_PROFISSIONAL?: string | null;
  CHAVE_ORIGEM?: string | null;
  PACIENTE?: string | null;
  FUNCIONÁRIO?: string | null;
  NOME?: string | null;
  NOME_SOC?: string | null;
  PARTICULARIDADE?: string | null;
  NR_CPF?: string | null; // Alterado para opcional, pois pode ser null no Excel
  DT_NASC?: string | null;
  VINCULO_MEDICO?: string | null;
  NR_DOC_PROF?: string | null; // Alterado para opcional
  UF_DOCUMENTO?: string | null; // Alterado para opcional
  ESPECIALIDADE?: string | null;
  MAE?: string | null;
  NM_MAE_CACHE?: string | null;
  PAI?: string | null;
  MOTIVO_INVALIDO?: string | null;
  CAMPO_INVALIDO?: string | null;
  CONTEUDO_INVALIDO?: string | null;
  CPF_UNIFICADO?: string | null;
  DT_INVALIDO?: string | null;
  "CPF rec Federal"?: string | null;
  "Nome Rec. Federal"?: string | null;
  "Dt. Nasc. Rec. Federal"?: string | null;
  "Nome conselho"?: string | null;
  "Nº conselho"?: string | null;
  "UF conselho"?: string | null;
  CONSELHO?: string | null;
  ANALISE?: string | null;
  AÇÃO?: string | null;
}

// Resultado do processamento estrutural do Excel
export interface ExcelProcessingResult {
  success: boolean;
  message: string;
  processedCount: number; // Quantidade de linhas válidas estruturalmente
  failedCount: number; // Quantidade de linhas com erros estruturais
  errors: { row: number; message: string; column?: string }[]; // Detalhes dos erros estruturais
  data: VinculoMedicoExcelRow[]; // Os dados mapeados e tipados
}

// Resultado do processamento em lote no VinculoMedicoService
export interface BatchProcessingResult {
  success: boolean;
  message: string;
  totalProcessed: number; // Total de linhas tentadas
  successfulUpdates: number; // Quantidade de atualizações bem-sucedidas no DB
  failedUpdates: number; // Quantidade de atualizações que falharam (regras de negócio/DB)
  errors: {
    rowData: VinculoMedicoExcelRow;
    message: string;
    type: "business" | "db";
  }[]; // Erros de negócio/DB por linha
}
