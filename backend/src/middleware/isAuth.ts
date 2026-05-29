import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { AppError } from "../error/appError";

export interface ReqUser extends Request {
  user_id: string;
  user_name: string;
}

const isAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new AppError("Não autorizado!", 400);

    throw error;
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET!;

  if (!secret) {
    const error = new AppError("Segredo JWT não configurado!", 400);

    throw error;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload | string;

    if (!decoded) {
      const error = new AppError("Não autorizado!", 401);

      throw error;
    }

    if (typeof decoded === "string") {
      const error = new AppError("Token inválido!", 401);

      throw error;
    }

    (req as ReqUser).user_id = decoded.user_id;
    (req as ReqUser).user_name = decoded.user_name;
  } catch (error) {
    next(error);
  }

  next();
};

export default isAuth;
