import api from './axios';
import { PaymentHistory, PaymentResponse, StkPushRequest } from '../types/payment.types';

/**
 * Step 1: Create the initial order record in the database
 * Returns the order object with the generated ID
 */
export const initializeOrder = async (cartData: any): Promise<any> => {
  const response = await api.post('/payments/order', cartData);
  // Ensure we return the data property specifically
  return response.data;
};

/**
 * Step 2: Trigger M-Pesa STK Push via Daraja API
 * Sends request to the user's phone for PIN entry
 */
export const triggerStkPush = async (paymentData: StkPushRequest): Promise<PaymentResponse> => {
  console.log("API: Triggering STK Push for Order", paymentData.orderId);
  const response = await api.post('/payments/stk-push', paymentData);
  return response.data;
};

/**
 * Admin: View all canteen revenue and system-wide transactions
 * Returns an array of PaymentHistory objects
 */
export const getAllHistory = async (): Promise<{ data: PaymentHistory[] }> => {
  const response = await api.get('/payments/all');
  
  // LOG: Verify structure for debugging
  console.log("API: Fetched Global History", response.data);

  // If backend returns { data: [...] }, return that. If it returns just [...], wrap it.
  const historyData = Array.isArray(response.data) ? response.data : (response.data.data || []);
  return { data: historyData };
};

/**
 * Student: View personal payment history for their own account
 * Returns an array of PaymentHistory objects
 */
export const getMyHistory = async (): Promise<{ data: PaymentHistory[] }> => {
  const response = await api.get('/payments/my-history');
  
  // LOG: Verify structure for debugging
  console.log("API: Fetched Personal History", response.data);

  // Defensive check to ensure we always pass an array back to the Redux Thunk
  const historyData = Array.isArray(response.data) ? response.data : (response.data.data || []);
  return { data: historyData };
};