import { Router } from "express";
import * as AdminController from "./admin.controller";
import { adminAuth } from "../../middleware/auth.middleware";

const adminRouter: Router = Router();

/**
 * PATH: /api/admin
 * Access: Admin Only
 */

// 1. Dashboard Stats - Protected by adminAuth
adminRouter.get("/dashboard", adminAuth, AdminController.getDashboardData);

export default adminRouter;