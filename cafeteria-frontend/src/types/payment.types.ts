export interface PaymentHistory {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  phoneNumber: string;
  checkoutRequestId: string;
  mpesaReceipt?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
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