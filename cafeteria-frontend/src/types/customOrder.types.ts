import { UserProfile } from './user.types';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'delivered';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CustomOrder {
  id: string;
  userId: string;
  description: string;
  takeawayLocation: string;
  status: OrderStatus;
  approvalStatus: ApprovalStatus;
  isClosed: boolean;
  createdAt?: string;
  
  // --- Relations ---
  // This allows you to call req.user.name in your Admin UI
  user?: UserProfile; 
}

export interface CustomOrderRequest {
  description: string;
  baseMeal?: string; // 👈 Add this line (the '?' makes it optional)
  requestDate: string; // ISO string format
  takeawayLocation: string;
}

export interface CustomOrderResponse {
  success: boolean;
  message?: string;
  data: CustomOrder | CustomOrder[];
}