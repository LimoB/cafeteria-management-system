import api from './axios';
import { PaymentResponse, StkPushRequest } from '../types/payment.types';

// Step 1: Create the order before paying
export const initializeOrder = async (cartData: any): Promise<PaymentResponse> => {
  const response = await api.post('/payments/order', cartData);
  return response.data;
};

// Step 2: Trigger M-Pesa STK Push
export const triggerStkPush = async (paymentData: StkPushRequest): Promise<PaymentResponse> => {
  const response = await api.post('/payments/stk-push', paymentData);
  return response.data;
};

// Admin: View all canteen revenue
export const getAllHistory = async (): Promise<PaymentResponse> => {
  const response = await api.get('/payments/all');
  return response.data;
};

// Student: View personal payment history
export const getMyHistory = async (): Promise<PaymentResponse> => {
  const response = await api.get('/payments/my-history');
  return response.data;
};