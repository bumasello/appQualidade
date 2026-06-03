import { randomInt } from "crypto";
import { AppError } from "../error/appError";
import { ReqUser } from "../middleware/isAuth";
import AuditService from "../service/audit.service";
import EmailService from "../service/email.service";
import UserService from "../service/user.service";
import { Handler } from "../type/handler";

export class UserController {
  private userService: UserService;
  private email_service: EmailService;
  constructor() {
    this.userService = new UserService();
    this.email_service = new EmailService();
  }

  public login_user: Handler = async (req, res, next) => {
    try {
      const { username, pass } = req.body;

      if (!username || !pass) {
        throw new AppError(
          "[loginUser] Usuário e senha são obrigatórios!",
          422,
        );
      }

      const result = await this.userService.login_user({ username, pass });

      if (!result.success) {
        throw new AppError(result.message, 400);
      }

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  public create_user: Handler = async (req, res, next) => {
    try {
      const { nome_completo, username, email, equipe_id } = req.body ?? {};

      if (!nome_completo || !username || !equipe_id || !email) {
        throw new AppError(
          "[createUser] Todos os campos são obrigatórios!",
          422,
        );
      }
      const result = await this.userService.create_user({
        username,
        email,
        nome_completo,
        equipe_id,
      });

      if (!result.success) {
        throw new AppError("[createUser] Erro ao criar usuário!", 422);
      }

      await this.email_service.send_user_created(
        email,
        result.pass ?? "Rededor@AppQualidade",
      );
      const req_user = req as ReqUser;
      await AuditService.registrar({
        user_id: Number(req_user.user_id),
        user_name: req_user.user_name,
        acao: "CRIAR_USUARIO",
        tabela: "usuario_app_qualidade",
        payload: { username, nome_completo, equipe_id },
        estado_antes: null,
      });

      return res
        .status(201)
        .json({ success: true, message: "Usuário criado!" });
    } catch (error) {
      next(error);
    }
  };

  public reset_password: Handler = async (req, res, next) => {
    try {
      const { username } = req.body ?? {};

      if (!username)
        throw new AppError(
          "[resetPassword] O campo username é obrigatório!",
          422,
        );

      const pass = randomInt(100_000, 1_000_000).toString();
      console.log(pass);

      const { EMAIL } = await this.userService.reset_password({
        username,
        pass,
      });

      await this.email_service.sendResetCode(EMAIL, pass);

      return res
        .status(200)
        .json({ success: true, message: "Senha resetada com sucesso!" });
    } catch (error) {
      next(error);
    }
  };

  public change_password: Handler = async (req, res, next) => {
    try {
      const { username, newpass: pass } = req.body ?? {};

      if (!username || !pass) {
        throw new AppError(
          "[change_password] Usuário e senha são obrigatórios!",
          422,
        );
      }

      const result = await this.userService.change_password({
        username,
        pass,
      });

      if (!result.success) {
        return res
          .status(400)
          .json({ success: false, message: result.message });
      }

      return res
        .status(200)
        .json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
      next(error);
    }
  };

  public listar: Handler = async (req, res, next) => {
    try {
      const usuarios = await this.userService.listar();

      return res.status(200).json({ success: true, usuarios });
    } catch (error) {
      next(error);
    }
  };

  public definir_equipe: Handler = async (req, res, next) => {
    try {
      const { equipe_id } = req.body ?? {};
      const user_id = req.params.id;

      const equipe_anterior = await this.userService.equipe_atual(
        Number(user_id),
      );

      const result = await this.userService.definir_equipe(
        Number(user_id),
        equipe_id,
      );

      if (!result.success)
        throw new AppError("Erro inesperado ao definir equipes!", 400);

      const req_user = req as ReqUser;
      await AuditService.registrar({
        user_id: Number(req_user.user_id),
        user_name: req_user.user_name,
        acao: "ALTERAR_EQUIPE_USUARIO",
        tabela: "usuario_app_qualidade",
        payload: { user_id: Number(user_id), equipe_id },
        estado_antes: { equipe_id: equipe_anterior },
      });

      return res
        .status(200)
        .json({ success: true, message: "Equipe associada ao usuário." });
    } catch (error) {
      next(error);
    }
  };

  public definir_status: Handler = async (req, res, next) => {
    try {
      const user_id = Number(req.params.id);
      const { ativo } = req.body ?? {};

      if (Number.isNaN(user_id))
        throw new AppError("id de usuário inválido!", 422);
      if (ativo !== 0 && ativo !== 1)
        throw new AppError("ativo deve ser 0 ou 1!", 422);

      await this.userService.definir_status(user_id, ativo);

      const req_user = req as ReqUser;
      await AuditService.registrar({
        user_id: Number(req_user.user_id),
        user_name: req_user.user_name,
        acao: ativo === 1 ? "ATIVAR_USUARIO" : "DESATIVAR_USUARIO",
        tabela: "usuario_app_qualidade",
        payload: { user_id, ativo },
        estado_antes: null,
      });

      return res
        .status(200)
        .json({ success: true, message: "Status atualizado!" });
    } catch (error) {
      next(error);
    }
  };
}
