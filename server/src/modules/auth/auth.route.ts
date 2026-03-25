import { Router } from "express";
import * as AuthController from "./auth.controller";

const authRouter: Router = Router();

/**
 * PATH: /api/auth
 */

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/logout", AuthController.logout);

// Password Management
authRouter.post("/forgot-password", AuthController.requestPasswordReset);
authRouter.post("/reset-password", AuthController.resetPassword);

export default authRouter;