import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as PaymentService from "./payment.service";
import axios from "axios";
import moment from "moment";

const getMpesaToken = async () => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  
  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
};

export const initializeOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { cart, takeawayLocation } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    
    const result = await PaymentService.validateAndCreateOrder(req.user.id, cart, takeawayLocation);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const triggerStkPush = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let { phoneNumber, amount, orderId } = req.body;

    // --- 1. PHONE NUMBER SANITIZATION (CRITICAL FOR 400 ERRORS) ---
    // Remove any +, spaces, or dashes
    let cleanPhone = phoneNumber.replace(/\D/g, "");
    
    // Convert 07... or 01... to 2547... or 2541...
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    }
    // If it starts with 7... or 1... add 254
    if (cleanPhone.length === 9 && (cleanPhone.startsWith("7") || cleanPhone.startsWith("1"))) {
      cleanPhone = "254" + cleanPhone;
    }

    const token = await getMpesaToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");
    
    const shortCode = process.env.MPESA_SHORTCODE;
    const passKey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");

   const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", 
      Amount: Math.round(Number(amount)), 
      PartyA: cleanPhone, 
      PartyB: shortCode,
      PhoneNumber: cleanPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      // SLICE the ID to ensure it never exceeds 12 chars
      AccountReference: orderId.replace("-", "").substring(0, 12), 
      TransactionDesc: "Canteen Payment",
    };

    console.log("--- DEBUG: Sending STK Push Payload ---", payload);

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Link Safaricom's CheckoutID to our Order
    await PaymentService.linkCheckoutID(orderId, data.CheckoutRequestID);

    res.status(200).json({ success: true, mpesaResponse: data });
  } catch (error: any) {
    // Log the specific Safaricom error message if available
    if (error.response) {
      console.error("--- MPESA API ERROR ---", error.response.data);
    } else {
      console.error("--- SERVER ERROR ---", error.message);
    }
    next(error);
  }
};


// No changes needed to triggerStkPush – just ensure you pass the customOrderId as 'orderId'

export const mpesaCallback = async (req: any, res: Response) => {
  try {
    console.log("--- RECEIVED MPESA CALLBACK ---", JSON.stringify(req.body));
    const { Body: { stkCallback } } = req.body;
    const checkoutID = stkCallback.CheckoutRequestID;

    if (stkCallback.ResultCode === 0) {
      const metadata = stkCallback.CallbackMetadata.Item;
      const receipt = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
      
      // NEW: This service function now checks both tables
      await PaymentService.updatePaymentStatus(checkoutID, "completed", receipt);
    } else {
      console.warn(`Payment failed for CheckoutID: ${checkoutID}.`);
      await PaymentService.updatePaymentStatus(checkoutID, "failed");
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Callback Error");
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await PaymentService.getAllPaymentsService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).send("Unauthorized");
    const data = await PaymentService.getUserPaymentsService(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};