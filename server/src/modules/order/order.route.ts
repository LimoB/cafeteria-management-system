import { Router } from "express";
import * as OrderController from "./order.controller";
import { userAuth, adminAuth } from "../../middleware/auth.middleware";

const orderRouter: Router = Router();

/**
 * PATH: /api/orders
 */

// 1. Admin: View all canteen orders
orderRouter.get("/", adminAuth, OrderController.getOrders);

// 2. Student: View ONLY their own orders (NEW)
// This solves the 403 Forbidden for the student dashboard
orderRouter.get("/my-orders", userAuth, OrderController.getMyOrders);

// 3. Student: Place a new order
orderRouter.post("/", userAuth, OrderController.createOrder);

// 4. Admin: Update order status (Ready, Collected, etc.)
orderRouter.patch("/:id/status", adminAuth, OrderController.updateOrderStatus);

export default orderRouter;