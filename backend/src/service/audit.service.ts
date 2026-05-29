import { AppError } from "../error/appError";
import MDMService from "./mdm.service";

interface RegistroAuditoria {
  user_id: number;
  user_name: string;
  acao: string;
  tabela: string;
  payload: object;
  estado_antes: object | null;
}

class AuditService {
  static async registrar(dados: RegistroAuditoria): Promise<void> {
    const mdm_service = new MDMService();
    try {
      await mdm_service.insert(
        `INSERT INTO ${process.env.MDM_TBL_AUDITORIA} 
   (ID, USUARIO_ID, USUARIO_NOME, ACAO, TABELA, PAYLOAD, ESTADO_ANTES)
   VALUES (${process.env.MDM_SEQ_AUDITORIA}.NEXTVAL, :usuarioId, :usuarioNome, :acao, :tabela, :payload, :estadoAntes)`,
        {
          usuarioId: dados.user_id,
          usuarioNome: dados.user_name,
          acao: dados.acao,
          tabela: dados.tabela,
          payload: JSON.stringify(dados.payload),
          estadoAntes: dados.estado_antes
            ? JSON.stringify(dados.estado_antes)
            : null,
        },
      );
    } catch (error) {
      throw new AppError("Erro inesperado ao registrar auditoria", 400);
    }
  }
}

export default AuditService;
