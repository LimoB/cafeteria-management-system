import api from './axios';
import { CustomOrder, CustomOrderRequest, CustomOrderResponse } from '../types/customOrder.types';

// Admin view
export const getAllCustomOrders = async (): Promise<CustomOrderResponse> => {
  const response = await api.get('/custom-orders');
  return response.data;
};

// Student view
export const createCustomOrder = async (orderData: CustomOrderRequest): Promise<CustomOrderResponse> => {
  const response = await api.post('/custom-orders', orderData);
  return response.data;
};

// Update order (Student or Admin)
export const updateCustomOrder = async (
  id: string, 
  updateData: Partial<CustomOrder>
): Promise<CustomOrderResponse> => {
  const response = await api.patch(`/custom-orders/${id}`, updateData);
  return response.data;
};

// Cancel request
export const deleteCustomOrder = async (id: string): Promise<CustomOrderResponse> => {
  const response = await api.delete(`/custom-orders/${id}`);
  return response.data;
};