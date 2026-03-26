import api from './axios';
import { PaymentHistory, PaymentResponse, StkPushRequest } from '../types/payment.types';

/**
 * Step 1: Create the initial order record in the database
 */
export const initializeOrder = async (cartData: any): Promise<any> => {
  const response = await api.post('/payments/order', cartData);
  return response.data; // { success: true, orderId, total }
};

/**
 * Step 2: Trigger M-Pesa STK Push via Daraja API
 */
export const triggerStkPush = async (paymentData: StkPushRequest): Promise<PaymentResponse> => {
  const response = await api.post('/payments/stk-push', paymentData);
  return response.data; // { success: true, mpesaResponse }
};

/**
 * Admin: View all transactions
 * Returns the full object containing the orders array
 */
export const getAllHistory = async (): Promise<{ success: boolean; orders: PaymentHistory[] }> => {
  const response = await api.get('/payments/all');
  return response.data; 
};

/**
 * Student: View personal history
 */
export const getMyHistory = async (): Promise<{ success: boolean; orders: PaymentHistory[] }> => {
  const response = await api.get('/payments/my-history');
  return response.data;
};

/**
 * User Lookup: Fix for the "User 4" 500 error
 */
export const getUserById = async (userId: string | number): Promise<any> => {
  const response = await api.get(`/payments/users/${userId}`);
  return response.data;
};