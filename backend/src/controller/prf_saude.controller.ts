import { AppError } from "../error/appError";
import PrfSaudeService from "../service/prf_saude.service"; // Importa a instância
import ExcelService from "../service/excel.service"; // Importa a instância

import type { Request, Response, NextFunction } from "express";
import { Handler } from "../type/handler";

export class PrfSaudeController {
  private prf_saude_service: PrfSaudeService;
  private excelService: ExcelService;

  constructor() {
    this.prf_saude_service = new PrfSaudeService();
    this.excelService = new ExcelService();
  }

  public vinculaMedico = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { crm, uf, cpf } = req.body;

      if (!crm || !uf || !cpf) {
        throw new AppError(
          "[vinculaMedico] Todos os campos são obrigatórios!",
          422,
        );
      }

      const result = await this.prf_saude_service.realizaVinculoMedico(
        crm,
        uf,
        cpf,
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
    next: NextFunction,
  ) => {
    try {
      const { crm, uf } = req.query;

      if (!crm || !uf) {
        throw new AppError(
          "[buscaMedico] Todos os campos são obrigatórios!",
          422,
        );
      }

      let crmValue: string;
      let ufValue: string;

      if (typeof crm === "string") {
        crmValue = crm;
      } else if (Array.isArray(crm) && typeof crm[0] === "string") {
        crmValue = crm[0];
      } else {
        throw new AppError("[buscaMedico] CRM inválido ou ausente!", 422);
      }

      if (typeof uf === "string") {
        ufValue = uf;
      } else if (Array.isArray(uf) && typeof uf[0] === "string") {
        ufValue = uf[0];
      } else {
        throw new AppError("[buscaMedico] UF inválido ou ausente!", 422);
      }

      const result = await this.prf_saude_service.buscaMedico(
        crmValue,
        ufValue,
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

  public vinculaMedicoBatch = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.file || !req.file.buffer) {
        throw new AppError(
          "Nenhum ficheiro Excel foi enviado ou o ficheiro está vazio.",
          400,
        );
      }

      const requiredHeaders = ["Nº conselho", "UF conselho", "CPF rec Federal"];

      const excelProcessResult = await this.excelService.processVinculoExcel(
        req.file.buffer,
        requiredHeaders,
      );

      if (excelProcessResult.data.length === 0) {
        throw new AppError(
          excelProcessResult.message ||
            "Nenhuma linha válida encontrada na planilha para processamento.",
          400,
        );
      }

      const batchProcessResult =
        await this.prf_saude_service.processaVinculoMedicoBatch(
          excelProcessResult.data,
        );

      const finalMessageParts: string[] = [];
      let overallSuccess = true;

      if (batchProcessResult.successfulUpdates > 0) {
        finalMessageParts.push(
          `${batchProcessResult.successfulUpdates} vínculos atualizados com sucesso.`,
        );
      }
      if (batchProcessResult.failedUpdates > 0) {
        finalMessageParts.push(
          `${batchProcessResult.failedUpdates} vínculos falharam na atualização.`,
        );
        overallSuccess = false;
      }
      if (excelProcessResult.failedCount > 0) {
        finalMessageParts.push(
          `${excelProcessResult.failedCount} linhas foram ignoradas devido a erros estruturais.`,
        );
        overallSuccess = false;
      }

      if (
        batchProcessResult.successfulUpdates === 0 &&
        excelProcessResult.processedCount === 0
      ) {
        overallSuccess = false;
        finalMessageParts.push("Nenhuma operação realizada com sucesso.");
      }

      const finalMessage =
        finalMessageParts.length > 0
          ? finalMessageParts.join(" ")
          : "Processamento concluído sem resultados específicos.";

      let statusCode = 200;
      if (!overallSuccess && batchProcessResult.successfulUpdates === 0) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: overallSuccess,
        message: finalMessage,
        details: {
          excelProcessing: excelProcessResult,
          batchProcessing: batchProcessResult,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public replicaCurriculoPrf: Handler = async (req, res, next) => {
    try {
      const file = req.file as Express.Multer.File;

      if (!file) {
        throw new AppError("Arquivo para replica é obrigatório!", 400);
      }

      const result = await this.prf_saude_service.replicaCurriculoPrf(
        file.buffer,
      );
      console.log(result);
      res.status(201).json({ ...result });
    } catch (error) {
      next(error);
    }
  };
}
