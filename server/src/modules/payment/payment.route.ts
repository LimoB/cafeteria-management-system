import { Router } from "express";
import * as PaymentController from "./payment.controller";
import { userAuth, adminAuth } from "../../middleware/auth.middleware";

const paymentRouter: Router = Router();

/* ================================
   STUDENT ROUTES
================================== */

// Initialize a new order (Validate cart and create pending record)
paymentRouter.post("/order", userAuth, PaymentController.initializeOrder);

// Trigger the M-Pesa STK Push on the student's phone
paymentRouter.post("/stk-push", userAuth, PaymentController.triggerStkPush);

// Get personal history (Now returns a flattened array for Redux)
paymentRouter.get("/my-history", userAuth, PaymentController.getMyHistory);


/* ================================
   ADMIN & UTILITY ROUTES
================================== */

// Get all system payments (Standard + Custom)
paymentRouter.get("/all", adminAuth, PaymentController.getHistory);

/** * FIX: This route resolves the "GET /api/users/4 500" error.
 * Ensure your main server.ts or app.ts uses this router for '/api/users'
 * OR add it here if it's part of the payment context.
 */
paymentRouter.get("/users/:id", userAuth, PaymentController.getUserById);


/* ================================
   PUBLIC ROUTES (CALLBACKS)
================================== */

// Safaricom hits this URL. Do NOT add auth middleware here.
paymentRouter.post("/callback", PaymentController.mpesaCallback);

export default paymentRouter;