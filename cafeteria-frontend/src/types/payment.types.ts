export interface PaymentHistory {
  id: string; // The Order ID (LKN-... or CUST-...)
  userId: number; // Changed to number to match your DB schema
  amount: number;
  takeawayLocation: string;
  
  // Aligning with your DB schema naming
  status: 'placed' | 'completed' | 'cancelled'; 
  paymentStatus: 'pending' | 'completed' | 'failed';
  
  // M-Pesa specific fields
  mpesaCheckoutRequestId?: string | null;
  mpesaReceiptNumber?: string | null;
  
  // UI helper: distinguish order types
  orderType?: 'standard' | 'custom';
  
  createdAt: string | null;
  
  // Included if the backend joins the user table
  user?: {
    username: string;
    email: string;
    phone: string;
  };
}

export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string; // Accepts LKN-... or CUST-...
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: PaymentHistory | PaymentHistory[];
  mpesaResponse?: {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}

export interface PaymentState {
  history: PaymentHistory[];
  isProcessing: boolean;
  isError: boolean;
  message: string;
}