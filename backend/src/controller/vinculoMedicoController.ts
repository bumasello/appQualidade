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
        res
          .status(201)
          .json({ success: result.success, message: result.message });
      } else {
        throw new AppError(result.message, 400);
      }
    } catch (error) {
      next(error);
    }
  };

  public buscaMedico = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { crm, uf } = req.query;

      if (!crm || !uf) {
        throw new AppError(
          "[buscaMedico] Todos os campos são obrigatórios!",
          422
        );
      }

      let crmValue: string;
      let ufValue: string;

      // Validação para crm
      if (typeof crm === "string") {
        crmValue = crm;
      } else if (Array.isArray(crm) && typeof crm[0] === "string") {
        crmValue = crm[0]; // Pega o primeiro valor se for um array de strings
      } else {
        // Se crm for undefined, ParsedQs, ou um array de algo que não é string
        throw new AppError("[buscaMedico] CRM inválido ou ausente!", 422);
      }

      // Validação para uf
      if (typeof uf === "string") {
        ufValue = uf;
      } else if (Array.isArray(uf) && typeof uf[0] === "string") {
        ufValue = uf[0]; // Pega o primeiro valor se for um array de strings
      } else {
        // Se uf for undefined, ParsedQs, ou um array de algo que não é string
        throw new AppError("[buscaMedico] UF inválido ou ausente!", 422);
      }

      const result = await this.viculoMedicoService.buscaMedico(
        crmValue,
        ufValue
      );

      if (result.success) {
        res.status(200).json({ message: result.message, data: result.data });
      } else {
        throw new AppError(result.message || "Erro ao buscar médico.", 400);
      }
    } catch (error) {
      next(error);
    }
  };
}
