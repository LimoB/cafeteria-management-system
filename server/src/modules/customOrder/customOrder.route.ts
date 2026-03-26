import { Router } from "express";
import * as CustomOrderController from "./customOrder.controller";
import { userAuth } from "../../middleware/auth.middleware";

const customOrderRouter: Router = Router();

/**
 * PATH: /api/custom-orders
 */

// Fetch all (Admin) or personal (Student)
customOrderRouter.get("/", userAuth, CustomOrderController.getCustomOrders);

// Submit a new special request
customOrderRouter.post("/", userAuth, CustomOrderController.createCustomOrder);

/**
 * NEW: Pay for a quoted custom order
 * Triggered when a student clicks the "Pay Now" button in their log
 */
customOrderRouter.post("/:id/pay", userAuth, CustomOrderController.payCustomOrder);

// Update status or details
customOrderRouter.patch("/:id", userAuth, CustomOrderController.updateCustomOrder);

// Cancel or remove request
customOrderRouter.delete("/:id", userAuth, CustomOrderController.deleteCustomOrder);

export default customOrderRouter;