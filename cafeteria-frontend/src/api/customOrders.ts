import api from './axios';
import { 
  CustomOrder, 
  CustomOrderRequest, 
  CustomOrderResponse, 
  CustomOrderPaymentValidation 
} from '../types/customOrder.types';

/**
 * FETCH ORDERS
 * Hits /api/custom-orders. 
 */
export const fetchCustomOrdersApi = async (): Promise<CustomOrderResponse<CustomOrder[]>> => {
  const response = await api.get('/custom-orders');
  return response.data;
};

// Submit a new custom request
export const createCustomOrderApi = async (orderData: CustomOrderRequest): Promise<CustomOrderResponse<CustomOrder>> => {
  const response = await api.post('/custom-orders', orderData);
  return response.data;
};

// Update order (Used by Admin to set Price/Approval)
export const updateCustomOrderApi = async (
  id: string, 
  updateData: Partial<CustomOrder>
): Promise<CustomOrderResponse<CustomOrder>> => {
  const response = await api.patch(`/custom-orders/${id}`, updateData);
  return response.data;
};

/**
 * TRIGGER M-PESA PAYMENT
 * Specifically for paying the quoted price of a custom order.
 * FIX: Explicitly set the generic to CustomOrderPaymentValidation
 */
export const payCustomOrderApi = async (id: string): Promise<CustomOrderResponse<CustomOrderPaymentValidation>> => {
  const response = await api.post(`/custom-orders/${id}/pay`);
  return response.data;
};

// Cancel/Remove request
export const deleteCustomOrderApi = async (id: string): Promise<CustomOrderResponse<null>> => {
  const response = await api.delete(`/custom-orders/${id}`);
  return response.data;
};