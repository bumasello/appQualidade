import MDMService from "./mdm.service";

export interface Tela {
  ID: number;
  CHAVE: string;
  NOME: string;
  DESCRICAO: string | null;
  ATIVO: number;
}

class TelaService {
  private mdm_service: MDMService;

  constructor() {
    this.mdm_service = new MDMService();
  }

  public async listar(): Promise<Tela[]> {
    return this.mdm_service.query<Tela>(
      `
        SELECT 
            ID, CHAVE, NOME, DESCRICAO, ATIVO
        FROM
            ${process.env.MDM_TBL_TELAS}
        WHERE
            ATIVO = 1
        ORDER BY 
            NOME
        `,
    );
  }
}

export default TelaService;
