import { Handler } from "../type/handler";
import { AppError } from "../error/appError";
import UserService from "../service/user.service";

export class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  public loginUser: Handler = async (req, res, next) => {
    try {
      const { username, pass } = req.body;

      if (!username || !pass) {
        throw new AppError(
          "[loginUser] Usuário e senha são obrigatórios!",
          422,
        );
      }

      const result = await this.userService.loginUser({ username, pass });

      if (!result.success) {
        throw new AppError(result.message, 400);
      }

      return res.status(200).json({
        success: result.success,
        message: result.message,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };

  public createUser: Handler = async (req, res, next) => {
    try {
      const { nome_completo, username, pass, email } = req.body ?? {};

      if (!nome_completo || !username || !pass || !email) {
        throw new AppError(
          "[createUser] Todos os campos são obrigatórios!",
          422,
        );
      }
      const result = await this.userService.createUser({
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
}
