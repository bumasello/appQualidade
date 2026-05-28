import Router from "express";
import { UserController } from "../controller/user.controller";

const userController = new UserController();

const router = Router();

router.post("/create_user", userController.create_user);
router.post("/login_user", userController.login_user);
router.post("/reset_password", userController.reset_password);
router.patch("/change_password", userController.change_password);

export default router;
