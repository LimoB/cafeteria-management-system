import { UserProfile } from './user.types';

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'collected' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  id?: string; 
  orderId?: string;
  menuItemId: number;
  foodName?: string; 
  price?: number;    
  quantity: number;
}

export interface Order {
  details: any;
  id: string; 
  userId: string;
  amount: number;
  locationId: number; 
  takeawayLocation: string; 
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  isClosed: boolean;
  createdAt: string; 
  
  // --- Relation Joins ---
  user?: UserProfile; 
  items: OrderItem[]; 
}

/**
 * What the Frontend sends to the Backend during checkout.
 * amount: Changed from totalAmount to match the backend controller and Drizzle schema.
 */
export interface OrderRequest {
  items: {
    menuItemId: number;
    quantity: number;
  }[];
  locationId: number;
  takeawayLocation: string;
  amount: number; 
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: Order | Order[]; 
  order?: Order;          
}