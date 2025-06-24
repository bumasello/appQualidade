import oracledb from "oracledb";
import OracleDatabase from "../database/oracleDatabase";
import VinculoMedico from "../model/vinculoMedico";

interface Medico {
  nome?: string;
  crm: string;
  uf: string;
  cpf?: string;
}

interface BuscaMedicoResult {
  success: boolean;
  message?: string;
  data?: Medico; // Opcional, conterá o objeto Medico em caso de sucesso
}

class VinculoMedicoService {
  public async realizaVinculoMedico(crm: string, uf: string, cpf: string) {
    const vinculo = new VinculoMedico({ crm, uf, cpf });

    const conn = await OracleDatabase.getConnection();

    try {
      const result = await conn.execute(
        "update bcr.BCR_CTR_EXT_CNS_PRF set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf",
        { cpf: vinculo.cpf, crm: vinculo.crm, uf: vinculo.uf },
        { autoCommit: true }
      );
      if (result.rowsAffected && result.rowsAffected > 0) {
        return {
          success: true,
          message: "Vinculo Realizado!",
        };
      } else {
        return {
          success: false,
          message: "Nenhum Vínculo Realizado!",
        };
      }
    } catch (error) {
      console.error(
        "[VinculoMedicoService] Erro ao realizar vínculo médico:",
        error
      );
      throw new Error("Erro ao criar vínculo médico.");
    } finally {
      await conn.close();
    }
  }

  public async buscaMedico(
    crm: string,
    uf: string
  ): Promise<BuscaMedicoResult> {
    const medico: Medico = {
      crm: crm,
      uf: uf,
    };

    const conn = await OracleDatabase.getConnection();

    try {
      const result = await conn.execute(
        "SELECT nome, NR_DOC_PRF AS crm, SG_UF AS uf, NR_CPF AS cpf FROM bcr.BCR_CTR_EXT_CNS_PRF WHERE NR_DOC_PRF = :crm AND SG_UF = :uf",
        { crm: medico.crm, uf: medico.uf },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows && result.rows.length > 0) {
        const medico = result.rows[0] as Medico;

        return {
          success: true,
          message: "Médico encontrado com sucesso!",
          data: medico,
        };
      } else {
        return {
          success: false,
          message: "Médico não encontrado.",
        };
      }
    } catch (error) {
      console.error(
        "[VinculoMedicoService] Erro ao realizar busca do médico: ",
        error
      );
      throw new Error("Erro ao criar vínculo médico.");
    } finally {
      await conn.close();
    }
  }
}

export default VinculoMedicoService;
