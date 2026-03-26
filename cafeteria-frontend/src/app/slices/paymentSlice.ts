import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as paymentApi from '../../api/payments';
import { PaymentHistory, PaymentState, StkPushRequest } from '../../types/payment.types';

const initialState: PaymentState = {
  history: [],
  isProcessing: false,
  isError: false,
  message: '',
};

// --- Thunks ---

export const initiateMpesaPayment = createAsyncThunk(
  'payments/stkPush',
  async (paymentData: StkPushRequest, thunkAPI) => {
    try {
      const data = await paymentApi.triggerStkPush(paymentData);
      return { 
        mpesa: data.mpesaResponse, 
        orderId: paymentData.orderId 
      };
    } catch (error: any) {
      const message = error.response?.data?.message || "M-Pesa STK Push failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchHistory',
  async (isAdmin: boolean, thunkAPI) => {
    try {
      // 1. Call the appropriate API
      const response = isAdmin 
        ? await paymentApi.getAllHistory() 
        : await paymentApi.getMyHistory();
      
      // 2. Extract the 'orders' array we defined in the backend controller
      // The backend now sends: { success: true, orders: [...] }
      const ordersArray = response.orders || [];

      return ordersArray as PaymentHistory[];
      
    } catch (error: any) {
      console.error("Redux Fetch Error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Could not load history"
      );
    }
  }
);

// --- Slice ---

export const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    resetPaymentStatus: (state) => {
      state.isProcessing = false;
      state.isError = false;
      state.message = '';
    },
    updateLocalPaymentStatus: (state, action: PayloadAction<{orderId: string, status: PaymentHistory['paymentStatus']}>) => {
      const index = state.history.findIndex(h => h.id === action.payload.orderId);
      if (index !== -1) {
        state.history[index].paymentStatus = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // STK Push Handlers
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.isProcessing = true;
        state.isError = false;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.message = "STK Push sent. Check your phone to enter PIN.";
        
        const index = state.history.findIndex(h => h.id === action.payload.orderId);
        if (index !== -1) {
          state.history[index].paymentStatus = "pending";
        }
      })
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      // History Fetch Handlers
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistory[]>) => {
        state.isProcessing = false;
        state.history = action.payload; // Guaranteed to be an array by the thunk
        state.isError = false;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isProcessing = false;
        state.isError = true;
        state.message = action.payload as string;
        state.history = []; // Reset on error to prevent mapping over undefined
      });
  },
});

export const { resetPaymentStatus, updateLocalPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;