import TelaService from "../service/telas.service";
import { Handler } from "../type/handler";

export class TelaController {
  private tela_service: TelaService;

  constructor() {
    this.tela_service = new TelaService();
  }

  public listar: Handler = async (req, res, next) => {
    try {
      const telas = await this.tela_service.listar();
      return res.status(200).json({ success: true, telas });
    } catch (error) {
      next(error);
    }
  };
}
