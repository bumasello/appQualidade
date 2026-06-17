import { Router } from "express";
import upload from "../config/multerConfig";
import CoberturasController from "../controller/coberturas.controller";
import hasAccess from "../middleware/hasAccess";
import isAuth from "../middleware/isAuth";

const router = Router();
const coberturas_controller = new CoberturasController();

router.post(
  "/cria_cobertura",
  isAuth,
  hasAccess("importacao-ppp"),
  upload.single("file_input"),
  coberturas_controller.cria_importacao,
);

export default router;
