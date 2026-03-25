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
      return data.mpesaResponse;
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
      const data = isAdmin 
        ? await paymentApi.getAllHistory() 
        : await paymentApi.getMyHistory();
      return data.data as PaymentHistory[];
    } catch (error: any) {
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
  },
  extraReducers: (builder) => {
    builder
      // STK Push
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state) => {
        state.isProcessing = false;
        state.message = "STK Push sent. Please enter your M-Pesa PIN on your phone.";
      })
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // History
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistory[]>) => {
        state.history = action.payload;
      });
  },
});

export const { resetPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;