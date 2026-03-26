import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as PaymentService from "./payment.service";
import axios from "axios";
import moment from "moment";

/**
 * HELPER: Generates M-Pesa Access Token
 */
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

/**
 * START ORDER: Validates cart and creates pending record
 */
export const initializeOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { cart, takeawayLocation } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    
    const result = await PaymentService.validateAndCreateOrder(req.user.id, cart, takeawayLocation);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("Initialize Order Error:", error.message);
    next(error);
  }
};

/**
 * STK PUSH: Triggers the M-Pesa Menu on user's phone
 */
export const triggerStkPush = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let { phoneNumber, amount, orderId } = req.body;

    // 1. Phone Sanitization
    let cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    }
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
      AccountReference: orderId.toString().replace("-", "").substring(0, 12), 
      TransactionDesc: "Canteen Payment",
    };

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Link Safaricom's CheckoutID to our database record
    await PaymentService.linkCheckoutID(orderId, data.CheckoutRequestID);

    res.status(200).json({ success: true, mpesaResponse: data });
  } catch (error: any) {
    console.error("--- MPESA API ERROR ---", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.errorMessage || "M-Pesa Gateway Connection Failed"
    });
  }
};

/**
 * MPESA CALLBACK: Safaricom hits this URL after user enters PIN
 */
export const mpesaCallback = async (req: any, res: Response) => {
  try {
    const { Body: { stkCallback } } = req.body;
    const checkoutID = stkCallback.CheckoutRequestID;

    if (stkCallback.ResultCode === 0) {
      const metadata = stkCallback.CallbackMetadata.Item;
      const receipt = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
      await PaymentService.updatePaymentStatus(checkoutID, "completed", receipt);
    } else {
      await PaymentService.updatePaymentStatus(checkoutID, "failed");
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Callback Processing Error:", error);
    res.status(500).send("Callback Error");
  }
};

/**
 * ADMIN: Get all system payments
 */
export const getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await PaymentService.getAllPaymentsService();
    // Return standard object structure to match frontend expectations
    res.status(200).json({ success: true, orders: data });
  } catch (error) {
    console.error("Get All History Error:", error);
    next(error);
  }
};

/**
 * STUDENT: Get personal payment history
 */
export const getMyHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No User Context" });
    }

    const data = await PaymentService.getUserPaymentsService(req.user.id);
    
    // Ensure we send back an object with an 'orders' array even if empty
    res.status(200).json({ 
      success: true, 
      orders: data || [] 
    });
  } catch (error: any) {
    console.error(`Error fetching history for User ${req.user?.id}:`, error.message);
    res.status(500).json({ success: false, message: "Database error retrieving history" });
  }
};

/**
 * USER MANAGEMENT: Fix for the "User 4" fetch error
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await PaymentService.findUserById(id); // Ensure this exists in your service
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User record not found" });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Get User Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error accessing User records" });
  }
};