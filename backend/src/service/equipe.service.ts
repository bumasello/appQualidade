import MDMDatabase from "../database/mdm_database";
import MDMService from "./mdm.service";

export interface Equipe {
  ID: number;
  NOME: string;
  DESCRICAO: string | null;
  ATIVO: number;
}

class EquipeService {
  private mdm_service: MDMService;

  constructor() {
    this.mdm_service = new MDMService();
  }

  public async listar(): Promise<Equipe[]> {
    return this.mdm_service.query<Equipe>(
      `
        SELECT 
            ID, NOME, DESCRICAO, ATIVO
        FROM
            ${process.env.MDM_TBL_EQUIPES}
        ORDER BY
            NOME
        `,
    );
  }

  public async criar(nome: string, desc: string | null) {
    return this.mdm_service.insert(
      `
        INSERT INTO 
            ${process.env.MDM_TBL_EQUIPES} (ID, NOME, DESCRICAO, ATIVO, DATA_CRIACAO)
        VALUES 
            (${process.env.MDM_SEQ_EQUIPES}.NEXTVAL, :nome, :descricao, 1, SYSDATE)
        `,
      { nome, descricao: desc },
    );
  }

  public async listar_telas(equipe_id: number): Promise<number[]> {
    const rows = await this.mdm_service.query<{ TELA_ID: number }>(
      `
        SELECT
            TELA_ID
        FROM
            ${process.env.MDM_TBL_EQUIPE_TELA}
        WHERE
            EQUIPE_ID = :equipe_id
        `,
      { equipe_id },
    );

    return rows.map((r) => r.TELA_ID);
  }

  public async definir_tela(equipe_id: number, tela_ids: number[]) {
    const conn = await MDMDatabase.getConnection();

    try {
      await conn.execute(
        `
    DELETE FROM 
        ${process.env.MDM_TBL_EQUIPE_TELA}
    WHERE
        EQUIPE_ID = :equipe_id
    `,
        { equipe_id },
        { autoCommit: false },
      );

      if (tela_ids.length > 0) {
        await conn.executeMany(
          `
            INSERT INTO
                ${process.env.MDM_TBL_EQUIPE_TELA} (EQUIPE_ID, TELA_ID)
            VALUES
                (:equipe_id, :tela_id)
            `,
          tela_ids.map((tela_id) => ({ equipe_id, tela_id })),
          { autoCommit: false },
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }
}

export default EquipeService;
