import { AppError } from "../error/appError";

import type {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("[Error Handler]", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({ success: false, message: "Erro interno do servidor" });
};

export default errorHandler;
