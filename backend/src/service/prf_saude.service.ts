import VinculoMedico from "../model/vinculoMedico";
import { BatchProcessingResult, VinculoMedicoExcelRow } from "../type/excel";
import ExcelService from "./excel.service";
import QLDService from "./qld.service";
import AuditService from "./audit.service";
import MDMService from "./mdm.service";

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
  FILIACAO: string;
  FORMACAO_ACADEMICA: string;
  TITULOS: string;
  ID_DQ_MEDICOS_ONCO: number;
  NOME_MEDICO_ONCO: string;
  NUMERO_CONSELHO_ONCO: string;
};

class PrfSaudeService {
  private excelService: ExcelService;
  private qld_service: QLDService;
  private mdm_service: MDMService;

  constructor() {
    this.excelService = new ExcelService();
    this.qld_service = new QLDService();
    this.mdm_service = new MDMService();
  }

  private normalizarTexto(texto: string): string {
    if (!texto) return "";

    return texto
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase();
  }

  public async replicaCurriculoPrf(
    file: Buffer,
    user_id: string,
    user_name: string,
  ) {
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
                    DM.FILIACAO,
                    DM.FORMACAO_ACADEMICA,
                    DM.TITULOS,
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

        await AuditService.registrar({
          user_id: Number(user_id),
          user_name: user_name,
          acao: "REPLICA_CURRICULO_PRF",
          tabela: process.env.QLD_TBL_MEDICOS!,
          payload: { ID_TAB_ONCO: p_id_tab_onco, NM_PROF: p_nm_prof },
          estado_antes: {
            filiacao: result.FILIACAO,
            formacao_academica: result.FORMACAO_ACADEMICA,
            titulos: result.TITULOS,
          },
        });

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

  public async realiza_vinculo_profissional(
    crm: string,
    uf: string,
    cpf: string,
    conselho: string,
    user_id: string,
    user_name: string,
  ) {
    const vinculo = new VinculoMedico({ crm, uf, cpf, conselho });

    try {
      const pre_audit = await this.mdm_service.query(
        `
      SELECT 
        NR_CPF
      FROM
        ${process.env.MDM_TBL_PRF_CADASTRO}  
      WHERE
        NR_DOC_PRF = :nr_doc_prf AND SG_UF = :uf AND SG_CONSELHO = :cons
        `,
        {
          nr_doc_prf: crm,
          uf: uf,
          cons: conselho,
        },
      );

      const audit = pre_audit[0] as {
        NR_CPF: string;
      };

      if (audit) {
        await AuditService.registrar({
          user_id: Number(user_id),
          user_name: user_name,
          acao: "REALIZA VINCULO MEDICO",
          tabela: process.env.MDM_TBL_PRF_CADASTRO!,
          payload: {
            crm: crm,
            uf: uf,
            cpf: cpf,
            cons: conselho,
          },
          estado_antes: { NR_CPF: audit.NR_CPF },
        });
      }

      const result = await this.mdm_service.update(
        `UPDATE 
          ${process.env.MDM_TBL_PRF_CADASTRO} 
        SET 
          nr_cpf = :cpf 
        WHERE 
          nr_doc_prf = :crm AND sg_uf = :uf AND SG_CONSELHO = :cons`,
        {
          cpf: vinculo.cpf,
          crm: vinculo.crm,
          uf: vinculo.uf,
          cons: vinculo.conselho,
        },
      );
      if (result.success && result.rows_affected > 0) {
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
        "[realiza_vinculo_profissional] Erro ao realizar vínculo profissional:",
        error,
      );
      throw new Error("Erro ao criar vínculo profissional.");
    }
  }

  public async busca_profissional(
    crm: string,
    uf: string,
    cons: string,
  ): Promise<BuscaMedicoResult> {
    try {
      const rows = await this.mdm_service.query<Medico>(
        `SELECT 
          NOME as nome, NR_DOC_PRF AS crm, SG_UF AS uf, NR_CPF AS cpf 
        FROM 
          ${process.env.MDM_TBL_PRF_CADASTRO} 
        WHERE 
          NR_DOC_PRF = :crm AND SG_UF = :uf AND SG_CONSELHO = :cons`,
        { crm, uf, cons },
      );

      if (rows.length > 0) {
        return {
          success: true,
          message: "Profissional encontrado com sucesso!",
          data: rows[0],
        };
      }

      return {
        success: false,
        message: "Profissional não encontrado.",
      };
    } catch (error) {
      console.error(
        "[busca_profissional] Erro ao realizar busca do profissional: ",
        error,
      );
      throw new Error("Erro ao buscar médico.");
    }
  }

  public async processaVinculoMedicoBatch(
    data: VinculoMedicoExcelRow[],
    user_id: string,
    user_name: string,
  ): Promise<BatchProcessingResult> {
    const result: BatchProcessingResult = {
      success: true,
      message: "Processamento de vínculos em lote concluído.",
      totalProcessed: data.length,
      successfulUpdates: 0,
      failedUpdates: 0,
      errors: [],
    };

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

    for (const rowData of data) {
      try {
        const ufConselho = rowData["UF conselho"]?.toUpperCase();

        if (!ufConselho || !validUFs.includes(ufConselho)) {
          result.failedUpdates++;
          result.errors.push({
            rowData,
            message: `UF '${rowData["UF conselho"]}' inválido.`,
            type: "business",
          });
          continue;
        }

        const pre_audit = await this.mdm_service.query<{ NR_CPF: string }>(
          `SELECT NR_CPF FROM ${process.env.MDM_TBL_PRF_CADASTRO} WHERE NR_DOC_PRF = :crm AND SG_UF = :uf`,
          { crm: rowData["Nº conselho"], uf: rowData["UF conselho"] },
        );

        const audit = pre_audit[0] ?? null;

        if (audit) {
          await AuditService.registrar({
            user_id: Number(user_id),
            user_name: user_name,
            acao: "VINCULO_MEDICO_BATCH",
            tabela: process.env.MDM_TBL_PRF_CADASTRO!,
            payload: {
              crm: rowData["Nº conselho"],
              uf: rowData["UF conselho"],
              cpf: rowData["CPF rec Federal"],
            },
            estado_antes: { NR_CPF: audit.NR_CPF },
          });
        }

        const updateResult = await this.mdm_service.update(
          `update ${process.env.MDM_TBL_PRF_CADASTRO} set nr_cpf = :cpf where nr_doc_prf = :crm and sg_uf = :uf`,
          {
            cpf: rowData["CPF rec Federal"],
            crm: rowData["Nº conselho"],
            uf: rowData["UF conselho"],
          },
        );

        if (updateResult.rows_affected > 0) {
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

    if (result.failedUpdates > 0) {
      result.success = false;
      result.message = `Processamento de vínculos concluído com ${result.failedUpdates} falhas.`;
    }

    return result;
  }

  public async lista_conselhos(): Promise<{
    success: boolean;
    conselhos: string[];
  }> {
    try {
      const conselhos: string[] = [];
      const result = await this.mdm_service.query<{ SG_CONSELHO: string }>(`
        SELECT DISTINCT SG_CONSELHO FROM ${process.env.MDM_TBL_PRF_CADASTRO}
        `);

      result.forEach((r) => {
        conselhos.push(r.SG_CONSELHO);
      });

      return {
        success: true,
        conselhos: conselhos,
      };
    } catch (error) {
      console.error(
        "[lista_conselhos] Erro ao realizar busca de conselhos: ",
        error,
      );
      throw new Error("Erro ao buscar conselhos.");
    }
  }
}

export default PrfSaudeService;
