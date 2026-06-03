import Router from "express";
import { UserController } from "../controller/user.controller";
import hasAccess from "../middleware/hasAccess";
import isAuth from "../middleware/isAuth";

const userController = new UserController();

const router = Router();

router.post("/create_user", userController.create_user);
router.post("/login_user", userController.login_user);
router.post("/reset_password", userController.reset_password);
router.patch("/change_password", userController.change_password);
router.get(
  "/listar",
  isAuth,
  hasAccess("configuracoes"),
  userController.listar,
);
router.patch(
  "/:id/equipe",
  isAuth,
  hasAccess("configuracoes"),
  userController.definir_equipe,
);
router.patch(
  "/:id/status",
  isAuth,
  hasAccess("configuracoes"),
  userController.definir_status,
);

export default router;
