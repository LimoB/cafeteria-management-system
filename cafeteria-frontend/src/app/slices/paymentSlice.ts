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
      const response: any = isAdmin 
        ? await paymentApi.getAllHistory() 
        : await paymentApi.getMyHistory();
      
      console.log("DEBUG: Raw API Response Received", response);

      /**
       * LOGIC UPDATE:
       * Your log shows: { success: true, data: { orders: [...], customRequests: [...] } }
       * We need to extract the 'orders' array specifically.
       */
      let ordersArray = [];

      if (response?.data?.orders) {
        ordersArray = response.data.orders;
      } else if (response?.orders) {
        ordersArray = response.orders;
      } else if (Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (Array.isArray(response)) {
        ordersArray = response;
      }

      console.log("DEBUG: Extracted Orders Array", ordersArray);
      return ordersArray as PaymentHistory[];
      
    } catch (error: any) {
      console.error("DEBUG: Fetch History Thunk Error", error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not load history");
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
      if (!Array.isArray(state.history)) {
        console.warn("REDUX: History state was not an array. Resetting.");
        state.history = [];
        return;
      }

      const index = state.history.findIndex(h => h.id === action.payload.orderId);
      if (index !== -1) {
        state.history[index].paymentStatus = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.isProcessing = true;
        state.isError = false;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.message = "STK Push sent. Check your phone to enter PIN.";
        
        if (Array.isArray(state.history)) {
          const index = state.history.findIndex(h => h.id === action.payload.orderId);
          if (index !== -1) {
            state.history[index].paymentStatus = "pending";
          }
        }
      })
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistory[]>) => {
        state.isProcessing = false;
        // The Thunk now guarantees an array, but we check again for safety
        if (Array.isArray(action.payload)) {
          state.history = action.payload;
        } else {
          console.error("REDUX: Payload is still not an array", action.payload);
          state.history = [];
        }
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isProcessing = false;
        state.isError = true;
        state.message = action.payload as string;
        if (!Array.isArray(state.history)) state.history = [];
      });
  },
});

export const { resetPaymentStatus, updateLocalPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;