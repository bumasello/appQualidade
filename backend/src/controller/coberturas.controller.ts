import { AppError } from "../error/appError";
import { ReqUser } from "../middleware/isAuth";
import CoberturasService from "../service/coberturas.service";
import { Handler } from "../type/handler";

class CoberturasController {
  private cobertura_service: CoberturasService;
  constructor() {
    this.cobertura_service = new CoberturasService();
  }
  public cria_importacao: Handler = async (req, res, next) => {
    try {
      const file = req.file as Express.Multer.File;
      const { nome_arquivo, tipo_importacao, ticket, obs } = req.body;
      const { user_id, user_name } = req as ReqUser;

      if (!file || !nome_arquivo || !tipo_importacao || !ticket) {
        throw new AppError("Arquivos e/ou campos faltando!", 400);
      }

      const id_importacao = await this.cobertura_service.cria_cobertura(
        user_name,
        file.buffer,
        nome_arquivo,
        tipo_importacao,
        ticket,
        "teste",
      );

      return res.status(201).json({
        success: true,
        id_importacao: id_importacao,
        message: "Importação criada com suscesso!",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CoberturasController;
