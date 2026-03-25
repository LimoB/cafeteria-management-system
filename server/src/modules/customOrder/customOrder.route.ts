import { Router } from "express";
import * as CustomOrderController from "./customOrder.controller";
import { userAuth, adminAuth } from "../../middleware/auth.middleware";

const customOrderRouter: Router = Router();

/**
 * PATH: /api/custom-orders
 */

// Admin: View all custom requests
customOrderRouter.get("/", adminAuth, CustomOrderController.getCustomOrders);

// User: Submit a new special request
customOrderRouter.post("/", userAuth, CustomOrderController.createCustomOrder);

// User/Admin: Update status or details
customOrderRouter.patch("/:id", userAuth, CustomOrderController.updateCustomOrder);

// User/Admin: Cancel or remove request
customOrderRouter.delete("/:id", userAuth, CustomOrderController.deleteCustomOrder);

export default customOrderRouter;