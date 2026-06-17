import OracleDB from "oracledb";
import { AppError } from "../error/appError";
import ExcelService from "./excel.service";
import QLDService from "./qld.service";

const MAPA_PPP: Record<string, string> = {
  ID_LINHA: "ID_LINHA",
  REGIONAL: "REGIONAL",
  "NOME UNIDADE": "NOME_UNIDADE",
  "1.CONVÊNIO": "CONVENIO",
  "2.REDE / PRODUTO": "REDE_PRODUTO",
  "3.PLANO": "PLANO",
  "4.TIPO DE CONTRATAÇÃO/ NIVEIS/DIVISÃO": "CONTRATACAO_NIVEL_DIVISAO",
  "5.ACOMODAÇÃO": "ACOMODACAO",
  INTERNADO: "INTERNADO",
  "ESPECIALIDADES INTERNAÇÃO": "ESPECIALIDADE_INTERNACAO",
  PS: "PS",
  "ESPECIALIDADES PS": "ESPECIALIDADE_PS",
  AMBULATÓRIO: "AMBULATORIO",
  "ESPECIALIDADES AMBULATÓRIO": "ESPECIALIDADE_AMBULATORIO",
  SADT: "SADT",
  "EXAMES CONTRATADOS": "EXAMES_CONTRATADOS",
  "AMBULATÓRIO ONCOLOGIA": "AMBULATORIO_ONCOLOGIA",
  OBSERVAÇÃO: "OBSERVACAO",
};

class CoberturasService {
  private excel_service: ExcelService;
  private qld_service: QLDService;

  constructor() {
    this.excel_service = new ExcelService();
    this.qld_service = new QLDService();
  }

  private saneia_celula(valor: string): string {
    return valor
      .replace(/\r?\n/g, ",")
      .replace(/\s*\|\s*/g, ",")
      .replace(/\s*;\s*/g, ",");
  }

  private saneia_linhas(
    rows: Record<string, string | null>[],
  ): Record<string, string | null>[] {
    return rows.map((row) => {
      const limpa: Record<string, string | null> = {};
      for (const [coluna, valor] of Object.entries(row)) {
        limpa[coluna] =
          typeof valor === "string" ? this.saneia_celula(valor) : valor;
      }
      return limpa;
    });
  }

  public async cria_cobertura(
    user: string,
    arq_buffer: Buffer,
    nome_arquivo: string,
    tipo_importacao: string,
    ticket: string,
    obs?: string,
  ) {
    const { headers, rows } = this.excel_service.readSheetAsMap(arq_buffer);

    if (rows.length === 0) {
      throw new AppError("A planilha não tem linhas de dados.", 400);
    }

    const linhas_com_dado = rows.filter((row) =>
      Object.values(row).some((v) => v != null && v !== ""),
    );
    const linhas_saneadas = this.saneia_linhas(linhas_com_dado);

    const missing = Object.keys(MAPA_PPP).filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      throw new AppError(`Cabeçalhos ausentes: ${missing.join(", ")}`, 400);
    }

    const sql = `
        INSERT INTO ${process.env.QLD_TBL_IMPORTACAO_PPP}
            (ID_IMPORTACAO, TIPO_IMPORTACAO, NOME_ARQUIVO, TICKET, USUARIO_UPLOAD,
            OBSERVACAO, STATUS, DATA_CRIACAO, DATA_PROCESSAMENTO, MENSAGEM_ERRO,
            ORDEM_EXECUCAO, NUM_EXECUCAO)
        VALUES
            (${process.env.QLD_SEQ_IMPORTACAO_PPP}.NEXTVAL, :tipo_importacao, :nome_arquivo, :ticket, :usuario_upload,
            :observacao, 'PENDENTE', SYSDATE, NULL, NULL,
            NULL, 0)
        RETURNING ID_IMPORTACAO INTO :id_importacao_out
        `;

    const binds = {
      tipo_importacao: tipo_importacao,
      nome_arquivo: nome_arquivo,
      ticket: ticket,
      usuario_upload: user,
      observacao: obs ?? null,
      id_importacao_out: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    };

    const { out_bind } = await this.qld_service.update<{
      id_importacao_out: number[];
    }>(sql, binds);

    const id_importacao = out_bind.id_importacao_out[0];
    try {
      const colunas = ["ID_IMPORTACAO", ...Object.values(MAPA_PPP)];
      const linhas_stg = linhas_saneadas.map((r) => {
        const linha: Record<string, any> = { ID_IMPORTACAO: id_importacao };
        for (const [header, col] of Object.entries(MAPA_PPP)) {
          linha[col] = r[header] ?? null;
        }
        return linha;
      });

      const sql_stg = `
      INSERT INTO 
        ${process.env.QLD_TBL_STG_PPP} (${colunas.join(", ")})
      VALUES
        (${colunas.map((c) => `:${c}`).join(", ")})
      `;

      const bind_defs: Record<string, any> = {};
      for (const col of colunas) {
        bind_defs[col] =
          col === "ID_IMPORTACAO"
            ? { type: OracleDB.NUMBER }
            : { type: OracleDB.STRING, maxSize: 4000 };
      }

      await this.qld_service.insert_many(sql_stg, linhas_stg, { bind_defs });
    } catch (error) {
      await this.qld_service.update(
        `DELETE FROM ${process.env.QLD_TBL_STG_PPP} WHERE ID_IMPORTACAO = :id`,
        { id: id_importacao },
      );
      await this.qld_service.update(
        `DELETE FROM ${process.env.QLD_TBL_IMPORTACAO_PPP} WHERE ID_IMPORTACAO = :id`,
        { id: id_importacao },
      );
      throw error;
    }
  }
}

export default CoberturasService;
