import { AppError } from "../error/appError";
import VinculoMedicoService from "../service/vinculoMedService";

import type { Request, Response, NextFunction } from "express";

export class VinculoMedicoController {
  private viculoMedicoService: VinculoMedicoService;

  constructor() {
    this.viculoMedicoService = new VinculoMedicoService();
  }

  public vinculaMedico = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { crm, uf, cpf } = req.body;

      if (!crm || !uf || !cpf) {
        throw new AppError(
          "[vinculaMedico] Todos os campos são obrigatórios!",
          422
        );
      }

      const result = await this.viculoMedicoService.realizaVinculoMedico(
        crm,
        uf,
        cpf
      );

      if (result.success) {
        res.status(201).json({ message: result.message });
      } else {
        throw new AppError(result.message, 400);
      }
    } catch (error) {
      next(error);
    }
  };
}
