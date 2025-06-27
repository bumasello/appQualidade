import oracledb from "oracledb";
import OracleDatabase from "../database/oracleDatabase";
import VinculoMedico from "../model/vinculoMedico";
import { BatchProcessingResult, VinculoMedicoExcelRow } from "../type/excel";

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
        { autoCommit: true },
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
        error,
      );
      throw new Error("Erro ao criar vínculo médico.");
    } finally {
      await conn.close();
    }
  }

  public async buscaMedico(
    crm: string,
    uf: string,
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
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
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
        error,
      );
      throw new Error("Erro ao criar vínculo médico.");
    } finally {
      await conn.close();
    }
  }

  public async processaVinculoMedicoBatch(
    data: VinculoMedicoExcelRow[],
  ): Promise<BatchProcessingResult> {
    const result: BatchProcessingResult = {
      success: true,
      message: "Processamento de vínculos em lote concluído.",
      totalProcessed: data.length,
      successfulUpdates: 0,
      failedUpdates: 0,
      errors: [],
    };

    let conn: oracledb.Connection | undefined;
    try {
      conn = await OracleDatabase.getConnection();
      // REMOVA ESTA LINHA: await conn.beginTransaction(); // Esta linha causava o erro

      for (const rowData of data) {
        try {
          // Realizar a operação de UPDATE no banco de dados
          const updateResult = await conn.execute(
            "update bcr.BCR_CTR_EXT_CNS_PRF set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf",
            {
              nr_cpf: rowData.NR_CPF,
              num_conselho: rowData["Nº conselho"],
              uf_conselho: rowData["UF conselho"],
            },
            { autoCommit: false }, // Isso garante que a transação não seja commitada após cada UPDATE
          );

          if (updateResult.rowsAffected && updateResult.rowsAffected > 0) {
            result.successfulUpdates++;
          } else {
            result.failedUpdates++;
            result.errors.push({
              rowData,
              message: "Registro de médico não encontrado para atualização.",
              type: "db",
            });
          }
        } catch (rowError: any) {
          result.failedUpdates++;
          result.errors.push({
            rowData,
            message: `Erro DB: ${rowError.message}`,
            type: "db",
          });
        }
      }

      // Se não houve falhas, faz o commit de todas as operações
      if (result.failedUpdates === 0) {
        await conn.commit();
      } else {
        // Se houve falhas, reverte todas as operações
        await conn.rollback();
        result.success = false;
        result.message = `Processamento de vínculos concluído com ${result.failedUpdates} falhas. A transação foi revertida.`;
      }
    } catch (error: any) {
      // Em caso de erro geral (ex: falha na conexão)
      if (conn) {
        try {
          await conn.rollback(); // Garante que a transação seja revertida em caso de erro inesperado
          console.error("Transação revertida devido a erro geral.");
        } catch (rollbackError) {
          console.error("Erro ao tentar reverter transação:", rollbackError);
        }
      }
      console.error(
        "[VinculoMedicoService] Erro geral no processamento em lote:",
        error,
      );
      result.success = false;
      result.message =
        "Erro interno no servidor ao processar o lote de vínculos.";
      result.errors = [
        {
          rowData: {} as VinculoMedicoExcelRow,
          message: result.message,
          type: "db",
        },
      ];
      result.successfulUpdates = 0;
      result.failedUpdates = data.length;
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeError) {
          console.error("Erro ao fechar a conexão:", closeError);
        }
      }
    }
    return result;
  }
}

export default VinculoMedicoService;
