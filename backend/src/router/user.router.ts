import Router from "express";
import { UserController } from "../controller/user.controller";

const userController = new UserController();

const router = Router();

router.post("/create_user", userController.createUser);
router.post("/login_user", userController.loginUser);

export default router;
