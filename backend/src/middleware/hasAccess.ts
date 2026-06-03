import { NextFunction, Request, Response } from "express";
import { AppError } from "../error/appError";
import MDMService from "../service/mdm.service";
import { ReqUser } from "./isAuth";

const hasAccess = (tela: string) => {
  if (!tela) throw new AppError("Uma tela precisa ser enviada!", 400);

  return async function (req: Request, res: Response, next: NextFunction) {
    const { equipe_id } = req as ReqUser;
    const mdm_service = new MDMService();

    try {
      const result = await mdm_service.query(
        `SELECT 
            t.CHAVE
          FROM
            ${process.env.MDM_TBL_EQUIPE_TELA} et
          JOIN
            ${process.env.MDM_TBL_TELAS} t ON
              t.ID = et.TELA_ID
          WHERE
            et.EQUIPE_ID = :equipe_id and t.ATIVO = 1 AND t.CHAVE = :tela
          `,
        { equipe_id: equipe_id, tela },
      );

      if (result.length > 0) {
        next();
      } else {
        const error = new AppError("Acesso negado!", 403);

        throw error;
      }
    } catch (error) {
      next(error);
    }
  };
};

export default hasAccess;
