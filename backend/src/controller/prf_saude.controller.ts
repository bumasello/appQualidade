import { AppError } from "../error/appError";
import PrfSaudeService from "../service/prf_saude.service"; // Importa a instância
import ExcelService from "../service/excel.service"; // Importa a instância

import type { Request, Response, NextFunction } from "express";
import { Handler } from "../type/handler";
import { ReqUser } from "../middleware/isAuth";

export class PrfSaudeController {
  private prf_saude_service: PrfSaudeService;
  private excelService: ExcelService;

  constructor() {
    this.prf_saude_service = new PrfSaudeService();
    this.excelService = new ExcelService();
  }

  public vincula_profissional = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { nr_doc, uf, cpf, selected_conselho } = req.body;
      const { user_id, user_name } = req as ReqUser;

      if (!nr_doc || !uf || !cpf || !selected_conselho) {
        throw new AppError(
          "[vincula_profissional] Todos os campos são obrigatórios!",
          422,
        );
      }

      const result = await this.prf_saude_service.realiza_vinculo_profissional(
        nr_doc,
        uf,
        cpf,
        selected_conselho,
        user_id,
        user_name,
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

  public busca_profissional = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { nr_doc, uf, cons } = req.query;

      if (!nr_doc || !uf || !cons) {
        throw new AppError(
          "[busca_profissional] Todos os campos são obrigatórios!",
          422,
        );
      }

      let nr_dc_value: string;
      let uf_value: string;
      let cons_value: string;

      if (typeof nr_doc === "string") {
        nr_dc_value = nr_doc;
      } else if (Array.isArray(nr_doc) && typeof nr_doc[0] === "string") {
        nr_dc_value = nr_doc[0];
      } else {
        throw new AppError(
          "[busca_profissional] CRM inválido ou ausente!",
          422,
        );
      }

      if (typeof uf === "string") {
        uf_value = uf;
      } else if (Array.isArray(uf) && typeof uf[0] === "string") {
        uf_value = uf[0];
      } else {
        throw new AppError("[busca_profissional] UF inválido ou ausente!", 422);
      }

      if (typeof cons === "string") {
        cons_value = cons;
      } else if (Array.isArray(cons) && typeof cons[0] === "string") {
        cons_value = cons[0];
      } else {
        throw new AppError(
          "[busca_profissional] Conselho inválido ou ausente!",
          422,
        );
      }

      const result = await this.prf_saude_service.busca_profissional(
        nr_dc_value,
        uf_value,
        cons_value,
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

      const { user_id, user_name } = req as ReqUser;
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
          user_id,
          user_name,
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
      const { user_id, user_name } = req as ReqUser;

      if (!file) {
        throw new AppError("Arquivo para replica é obrigatório!", 400);
      }

      const result = await this.prf_saude_service.replicaCurriculoPrf(
        file.buffer,
        user_id,
        user_name,
      );
      console.log(result);
      res.status(201).json({ ...result });
    } catch (error) {
      next(error);
    }
  };

  public lista_conselhos: Handler = async (req, res, next) => {
    try {
      const result = await this.prf_saude_service.lista_conselhos();

      if (!result.success) {
        throw new AppError("Erro ao buscar conselhos!", 400);
      }

      return res.status(200).json({ conselhos: result.conselhos });
    } catch (error) {
      next(error);
    }
  };
}
