import { Router } from "express";
import * as PaymentController from "./payment.controller";
import { userAuth, adminAuth } from "../../middleware/auth.middleware";

const paymentRouter: Router = Router();

// Student
paymentRouter.post("/order", userAuth, PaymentController.initializeOrder);
paymentRouter.post("/stk-push", userAuth, PaymentController.triggerStkPush);
paymentRouter.get("/my-history", userAuth, PaymentController.getMyHistory);

// Admin
paymentRouter.get("/all", adminAuth, PaymentController.getHistory);

// Public (Safaricom)
paymentRouter.post("/callback", PaymentController.mpesaCallback);

export default paymentRouter;