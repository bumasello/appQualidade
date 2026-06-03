import { AppError } from "../error/appError";
import { ReqUser } from "../middleware/isAuth";
import AuditService from "../service/audit.service";
import EquipeService from "../service/equipe.service";
import { Handler } from "../type/handler";

export class EquipeController {
  private equipe_service: EquipeService;

  constructor() {
    this.equipe_service = new EquipeService();
  }

  public listar: Handler = async (req, res, next) => {
    try {
      const equipes = await this.equipe_service.listar();

      return res.status(200).json({ success: true, equipes });
    } catch (error) {
      next(error);
    }
  };

  public criar: Handler = async (req, res, next) => {
    try {
      const { nome, descricao } = req.body ?? {};
      if (!nome) throw new AppError("O nome da equipe é obrigatório!", 422);

      await this.equipe_service.criar(nome, descricao ?? null);
      const req_user = req as ReqUser;
      await AuditService.registrar({
        user_id: Number(req_user.user_id),
        user_name: req_user.user_name,
        acao: "CRIAR_EQUIPE",
        tabela: "equipe_app_qualidade",
        payload: { nome, descricao },
        estado_antes: null,
      });
      return res.status(201).json({ success: true, message: "Equipe criada!" });
    } catch (error) {
      next(error);
    }
  };

  public listar_telas: Handler = async (req, res, next) => {
    try {
      const equipe_id = Number(req.params.id);
      if (Number.isNaN(equipe_id)) throw new AppError("Id inválido!", 422);
      const tela_ids = await this.equipe_service.listar_telas(equipe_id);

      return res.status(201).json({ success: true, tela_ids });
    } catch (error) {
      next(error);
    }
  };

  public definir_telas: Handler = async (req, res, next) => {
    try {
      const equipe_id = Number(req.params.id);
      const { tela_ids } = req.body ?? {};

      if (Number.isNaN(equipe_id))
        throw new AppError("Id de equipe inválido!", 422);

      if (!Array.isArray(tela_ids))
        throw new AppError("Ids de tela deve ser um array!", 422);

      const estado_antes = await this.equipe_service.listar_telas(equipe_id);
      await this.equipe_service.definir_tela(equipe_id, tela_ids);

      const req_user = req as ReqUser;
      await AuditService.registrar({
        user_id: Number(req_user.user_id),
        user_name: req_user.user_name,
        acao: "DEFINIR_TELAS",
        tabela: "equipe_tela_app_qualidade",
        payload: { equipe_id, tela_ids },
        estado_antes: { tela_ids: estado_antes },
      });

      return res
        .status(200)
        .json({ success: true, message: "Permissões atualizadas!" });
    } catch (error) {
      next(error);
    }
  };
}
