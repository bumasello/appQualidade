import { AppError } from "../error/appError";
import UtilitariosService from "../service/utilitarios.service";
import { Handler } from "../type/handler";

export class UtilitariosController {
  private utilitariosService: UtilitariosService;
  constructor() {
    this.utilitariosService = new UtilitariosService();
  }

  public comparadorPlanilha: Handler = async (req, res, next) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;

      if (!files?.fileOld?.[0] || !files?.fileNew?.[0]) {
        throw new AppError("Os dois arquivos são obrigatórios!", 400);
      }

      const raw = req.body.selectedColumns;
      let selectedColumns: string[] = [];

      if (typeof raw === "string") {
        selectedColumns = JSON.parse(raw);
      } else if (Array.isArray(raw)) {
        selectedColumns = raw;
      }

      if (selectedColumns.length === 0) {
        throw new AppError("Selecione ao menos uma coluna para comparar!", 400);
      }

      const result = this.utilitariosService.compararPlanilhas(
        files.fileOld[0].buffer,
        files.fileNew[0].buffer,
        selectedColumns,
      );

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
