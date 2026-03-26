import { UserProfile } from './user.types';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

// 1. ADD: Specific type for the M-Pesa validation response
export interface CustomOrderPaymentValidation {
  orderId: string;
  amount: number;
  phoneNumber: string;
}

export interface CustomOrder {
  id: string;
  userId: string;
  description: string;
  takeawayLocation: string;
  price: number; 
  status: OrderStatus;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus; 
  isClosed: boolean;
  createdAt?: string | null;
  user?: UserProfile; 
}

export interface CustomOrderRequest {
  description: string;
  baseMeal?: string; 
  requestDate: string; 
  takeawayLocation: string;
}

// 2. UPDATE: Make the response generic so it can handle Orders OR Validation data
export interface CustomOrderResponse<T = CustomOrder | CustomOrder[]> {
  success: boolean;
  message?: string;
  data: T;
}