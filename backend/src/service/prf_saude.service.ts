import oracledb from "oracledb";
import mdm_database from "../database/mdm_database";
import VinculoMedico from "../model/vinculoMedico";
import { BatchProcessingResult, VinculoMedicoExcelRow } from "../type/excel";
import ExcelService from "./excel.service";
import QLDService from "./qld.service";

interface Medico {
  nome?: string;
  crm: string;
  uf: string;
  cpf?: string;
}

interface BuscaMedicoResult {
  success: boolean;
  message?: string;
  data?: Medico;
}

type ReplicaCurriculoRows = Record<string, string | null> & {
  ID_TAB_ONCO: string;
  NM_PROF: string;
};

type PrfRows = {
  ID_DQ_MEDICOS: number;
  NOME_MEDICO_DQ: string;
  NUMERO_CONSELHO_DQ: string;
  ID_DQ_MEDICOS_ONCO: number;
  NOME_MEDICO_ONCO: string;
  NUMERO_CONSELHO_ONCO: string;
};

class PrfSaudeService {
  private excelService: ExcelService;
  private qld_service: QLDService;

  constructor() {
    this.excelService = new ExcelService();
    this.qld_service = new QLDService();
  }

  private normalizarTexto(texto: string): string {
    if (!texto) return "";

    return texto
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase();
  }

  public async replicaCurriculoPrf(file: Buffer) {
    let sucesso = 0;
    let error_count = 0;
    const erros = [];
    const { rows } =
      this.excelService.readSheetAsMap<ReplicaCurriculoRows>(file);

    for (const row of rows) {
      try {
        const p_id_tab_onco = row.ID_TAB_ONCO;
        const p_nm_prof = row.NM_PROF;

        const database_rows = await this.qld_service.query<PrfRows>(
          `
                SELECT
                    DM.ID_DQ_MEDICOS,
                    DM.NOME_MEDICO as NOME_MEDICO_DQ,
                    DM.NUMERO_CONSELHO as NUMERO_CONSELHO_DQ,
                    DMO.ID_DQ_MEDICOS_ONCO,
                    DMO.NOME_MEDICO as NOME_MEDICO_ONCO,
                    TO_CHAR(DMO.NUMERO_CONSELHO) as NUMERO_CONSELHO_ONCO
                FROM
                    ${process.env.QLD_TBL_MEDICOS_ONCO} DMO
                LEFT JOIN ${process.env.QLD_TBL_MEDICOS} DM
                ON
                    (trim(DM.NOME_MEDICO) = trim(DMO.NOME_MEDICO))
                WHERE
                    DMO.ID_DQ_MEDICOS_ONCO = :id
        `,
          {
            id: p_id_tab_onco,
          },
        );

        if (database_rows.length === 0) {
          erros.push(
            `Id da tabela de Oncologia não encontrado na DQ_MEDICOS_ONCO. ID_TAB_ONCO: ${p_id_tab_onco}, NM_PROF: ${p_nm_prof}`,
          );
          error_count += 1;
          continue;
        }

        const result = database_rows[0];

        const nome_dq = this.normalizarTexto(result.NOME_MEDICO_DQ);
        const nome_onco = this.normalizarTexto(result.NOME_MEDICO_ONCO);

        if (nome_dq !== nome_onco) {
          erros.push(
            `Comparação de nomes falhou. NOME: ${nome_dq} | NOME_ONCO: ${nome_onco}`,
          );
          error_count += 1;
          continue;
        }

        if (result.NUMERO_CONSELHO_DQ !== result.NUMERO_CONSELHO_ONCO) {
          erros.push(
            `Comparação de número de conselho falhou. NUMERO_DQ: ${result.NUMERO_CONSELHO_DQ} | NUMERO_CONSELHO_ONCO: ${result.NUMERO_CONSELHO_ONCO}`,
          );
          error_count += 1;
          continue;
        }

        await this.qld_service.update(
          `
       UPDATE ${process.env.QLD_TBL_MEDICOS} DQ
                SET
                    FILIACAO = (
                        SELECT ONCO.FILIACAO
                        FROM ${process.env.QLD_TBL_MEDICOS_ONCO} ONCO
                        WHERE ONCO.NUMERO_CONSELHO = DQ.NUMERO_CONSELHO
                        AND trim(ONCO.NOME_MEDICO) = trim(DQ.NOME_MEDICO)
                        AND ONCO.FILIACAO IS NOT NULL
                    ),
                    FORMACAO_ACADEMICA = (
                        SELECT ONCO.FORMACAO_ACADEMICA
                        FROM ${process.env.QLD_TBL_MEDICOS_ONCO} ONCO
                        WHERE ONCO.NUMERO_CONSELHO = DQ.NUMERO_CONSELHO
                        AND trim(ONCO.NOME_MEDICO) = trim(DQ.NOME_MEDICO)
                        AND ONCO.FORMACAO_ACADEMICA IS NOT NULL
                    ),
                    TITULOS = (
                        SELECT ONCO.TITULOS
                        FROM ${process.env.QLD_TBL_MEDICOS_ONCO} ONCO
                        WHERE ONCO.NUMERO_CONSELHO = DQ.NUMERO_CONSELHO
                        AND trim(ONCO.NOME_MEDICO) = trim(DQ.NOME_MEDICO)
                        AND ONCO.TITULOS IS NOT NULL
                    )
                WHERE DQ.ID_DQ_MEDICOS = :id
        `,
          { id: result.ID_DQ_MEDICOS },
          1,
        );

        sucesso += 1;
      } catch (error) {
        erros.push(
          `Erro ao processar linha: NM_PROF: ${row.NM_PROF} | ID_TAB_ONCO: ${row.ID_TAB_ONCO}`,
        );
        error_count += 1;
      }
    }
    return {
      success: true,
      "total linhas": rows.length,
      erros: error_count,
      detalhes: erros,
    };
  }

  public async realizaVinculoMedico(crm: string, uf: string, cpf: string) {
    const vinculo = new VinculoMedico({ crm, uf, cpf });

    const conn = await mdm_database.getConnection();

    try {
      const result = await conn.execute(
        `update ${process.env.MDM_TBL_PRF_CADASTRO} set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf`,
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

    const conn = await mdm_database.getConnection();

    try {
      const result = await conn.execute(
        `SELECT nome, NR_DOC_PRF AS crm, SG_UF AS uf, NR_CPF AS cpf FROM ${process.env.MDM_TBL_PRF_CADASTRO} WHERE NR_DOC_PRF = :crm AND SG_UF = :uf`,
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
      conn = await mdm_database.getConnection();

      for (const rowData of data) {
        try {
          const ufConselho = rowData["UF conselho"]?.toUpperCase();
          const validUFs = [
            "AC",
            "AL",
            "AP",
            "AM",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MT",
            "MS",
            "MG",
            "PA",
            "PB",
            "PR",
            "PE",
            "PI",
            "RJ",
            "RN",
            "RS",
            "RO",
            "RR",
            "SC",
            "SP",
            "SE",
            "TO",
          ];
          if (!ufConselho || !validUFs.includes(ufConselho)) {
            result.failedUpdates++;
            result.errors.push({
              rowData,
              message: `UF '${rowData["UF conselho"]}' inválido.`,
              type: "business",
            });
            continue;
          }

          const updateResult = await conn.execute(
            `update ${process.env.MDM_TBL_PRF_CADASTRO} set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf`,
            {
              cpf: rowData["CPF rec Federal"],
              crm: rowData["Nº conselho"],
              uf: rowData["UF conselho"],
            },
            { autoCommit: false },
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

      if (result.failedUpdates === 0) {
        await conn.commit();
      } else {
        await conn.rollback();
        result.success = false;
        result.message = `Processamento de vínculos concluído com ${result.failedUpdates} falhas. A transação foi revertida.`;
      }
    } catch (error: any) {
      if (conn) {
        try {
          await conn.rollback();
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

export default PrfSaudeService;
