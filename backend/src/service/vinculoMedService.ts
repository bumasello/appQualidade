import OracleDatabase from "../database/oracleDatabase";
import VinculoMedico from "../model/vinculoMedico";

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
}

export default VinculoMedicoService;
