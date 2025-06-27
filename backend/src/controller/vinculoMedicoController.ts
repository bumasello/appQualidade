import { AppError } from "../error/appError";
import VinculoMedicoService from "../service/vinculoMedService"; // Importa a instância
import ExcelService from "../service/ExcelService"; // Importa a instância

import type { Request, Response, NextFunction } from "express";

export class VinculoMedicoController {
  private vinculoMedicoService: VinculoMedicoService;
  private excelService: ExcelService;

  constructor() {
    this.vinculoMedicoService = new VinculoMedicoService();
    this.excelService = new ExcelService();
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

      const result = await this.vinculoMedicoService.realizaVinculoMedico(
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

      // A validação de presença já está aqui, então o if (!crm || !uf) inicial é redundante
      // e pode ser removido se preferir. Mantive para não alterar muito a estrutura original.
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

      const result = await this.vinculoMedicoService.buscaMedico(
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

  public vinculaMedicoBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file || !req.file.buffer) {
        throw new AppError(
          "Nenhum ficheiro Excel foi enviado ou o ficheiro está vazio.",
          400
        );
      }

      // Defina os cabeçalhos OBRIGATÓRIOS que espera na planilha para esta operação
      // Estes devem corresponder EXATAMENTE aos nomes das colunas na planilha Excel
      const requiredHeaders = ["Nº conselho", "UF conselho", "CPF rec Federal"];

      // 1. Processamento estrutural do Excel pelo ExcelService
      const excelProcessResult = await this.excelService.processVinculoExcel(
        req.file.buffer,
        requiredHeaders
      );

      // Se NENHUMA linha válida foi extraída do Excel, então é um erro que impede o processamento.
      // excelProcessResult.success pode ser false se houve erros em algumas linhas, mas data.length > 0
      if (excelProcessResult.data.length === 0) {
        throw new AppError(
          excelProcessResult.message ||
            "Nenhuma linha válida encontrada na planilha para processamento.",
          400 // Bad Request, pois o ficheiro não continha dados processáveis
        );
      }
      // console.log(excelProcessResult.data);

      // res.status(200).json({ success: true });
      // console.log(excelProcessResult); // Manter para depuração se necessário
      // console.log(excelProcessResult.data);

      // 2. Processamento de negócio e atualização no banco pelo VinculoMedicoService
      // Corrigido o typo 'processaVinculoMedicoBatch' para 'processVinculoMedicoBatch'
      const batchProcessResult =
        await this.vinculoMedicoService.processaVinculoMedicoBatch(
          excelProcessResult.data
        );

      // Agora, construímos uma mensagem de resposta abrangente que inclui todos os resultados.
      const finalMessageParts: string[] = [];
      let overallSuccess = true; // Assume sucesso geral, a menos que haja falhas críticas

      if (batchProcessResult.successfulUpdates > 0) {
        finalMessageParts.push(
          `${batchProcessResult.successfulUpdates} vínculos atualizados com sucesso.`
        );
      }
      if (batchProcessResult.failedUpdates > 0) {
        finalMessageParts.push(
          `${batchProcessResult.failedUpdates} vínculos falharam na atualização.`
        );
        overallSuccess = false; // Se houve falhas no DB/negócio, o sucesso geral é parcial ou falho
      }
      if (excelProcessResult.failedCount > 0) {
        finalMessageParts.push(
          `${excelProcessResult.failedCount} linhas foram ignoradas devido a erros estruturais.`
        );
        overallSuccess = false; // Se houve falhas estruturais, o sucesso geral é parcial ou falho
      }

      // Se não houve nenhuma operação bem-sucedida (nem estrutural, nem no DB)
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

      // Determina o status HTTP com base no resultado
      let statusCode = 200; // OK para sucesso total ou parcial
      if (!overallSuccess && batchProcessResult.successfulUpdates === 0) {
        statusCode = 400; // Bad Request se nada foi processado com sucesso
      }

      res.status(statusCode).json({
        success: overallSuccess, // Indica se o processo foi totalmente bem-sucedido ou teve falhas
        message: finalMessage,
        details: {
          excelProcessing: excelProcessResult, // Detalhes do processamento estrutural
          batchProcessing: batchProcessResult, // Detalhes do processamento em lote (DB/negócio)
        },
      });
    } catch (error) {
      // O errorHandler global irá capturar os AppErrors lançados
      next(error);
    }
  };
}
