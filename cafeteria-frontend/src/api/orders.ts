import api from './axios';
import { OrderResponse, OrderRequest, OrderStatus } from '../types/order.types';

/**
 * [ADMIN] View all canteen orders
 */
export const getAllOrders = async (): Promise<OrderResponse> => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * [STUDENT] View ONLY their own orders
 * This points to the new route we added to the backend
 */
export const getUserOrders = async (): Promise<OrderResponse> => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

/**
 * [STUDENT] Place a new order
 */
export const createOrder = async (orderData: OrderRequest): Promise<OrderResponse> => {
  console.log("Axios calling POST /orders with:", JSON.stringify(orderData));
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * [ADMIN] Update status (Preparing, Ready, Collected, etc.)
 */
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<OrderResponse> => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};