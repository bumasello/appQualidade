import { Handler } from "../type/handler";
import { AppError } from "../error/appError";
import UserService from "../service/user.service";
import { randomInt } from "crypto";
import EmailService from "../service/email.service";

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
        success: result.success,
        message: result.message,
        token: result.token,
        nome_completo: result.nome_completo,
        primeiro_acesso: result.primeiro_acesso,
      });
    } catch (error) {
      next(error);
    }
  };

  public create_user: Handler = async (req, res, next) => {
    try {
      const { nome_completo, username, pass, email } = req.body ?? {};

      if (!nome_completo || !username || !pass || !email) {
        throw new AppError(
          "[createUser] Todos os campos são obrigatórios!",
          422,
        );
      }
      const result = await this.userService.create_user({
        username,
        email,
        nome_completo,
        pass,
      });

      if (!result.success) {
        throw new AppError("[createUser] Erro ao criar usuário!", 422);
      }

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
}
