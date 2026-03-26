import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as customOrderApi from '../../api/customOrders';
import { triggerStkPush } from '../../api/payments';
import { RootState } from '../store';
import { 
  CustomOrder, 
  CustomOrderRequest, 
  CustomOrderResponse, 
  CustomOrderPaymentValidation 
} from '../../types/customOrder.types';

interface CustomOrderState {
  customOrders: CustomOrder[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: CustomOrderState = {
  customOrders: [],
  isLoading: false,
  isError: false,
  message: '',
};

// --- Thunks ---

export const getCustomOrders = createAsyncThunk(
  'customOrders/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await customOrderApi.fetchCustomOrdersApi();
      return data.data as CustomOrder[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const submitCustomOrder = createAsyncThunk(
  'customOrders/create',
  async (orderData: CustomOrderRequest, thunkAPI) => {
    try {
      const data = await customOrderApi.createCustomOrderApi(orderData);
      return data.data as CustomOrder;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'customOrders/update',
  async ({ id, updateData }: { id: string; updateData: Partial<CustomOrder> }, thunkAPI) => {
    try {
      const data = await customOrderApi.updateCustomOrderApi(id, updateData);
      return data.data as CustomOrder;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * FIXED THUNK: INITIATE M-PESA STK PUSH
 * Accepts phoneNumber directly from the component to bypass state desync.
 */
export const initiateCustomPayment = createAsyncThunk(
  'customOrders/pay',
  async ({ orderId, phoneNumber: manualPhone }: { orderId: string, phoneNumber: string }, thunkAPI) => {
    try {
      // 1. Validate order and get payment details from backend
      const response = await customOrderApi.payCustomOrderApi(orderId) as CustomOrderResponse<CustomOrderPaymentValidation>;
      const { amount, phoneNumber: apiPhone } = response.data;

      // 2. Priority: Manually passed phone > API response phone > Redux state fallback
      const state = thunkAPI.getState() as RootState;
      const userPhoneFromState = (state.auth.user as any)?.phone;
      
      const finalPhone = manualPhone || apiPhone || userPhoneFromState;

      if (!finalPhone) {
        return thunkAPI.rejectWithValue("Phone number missing. Please update your profile.");
      }

      // 3. Trigger STK Push
      await triggerStkPush({ 
        orderId, 
        amount, 
        phoneNumber: String(finalPhone).replace(/\s/g, '') // Remove spaces
      });

      return orderId; 
    } catch (error: any) {
      console.error("Payment Initiation Error:", error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Payment failed");
    }
  }
);

export const cancelCustomOrder = createAsyncThunk(
  'customOrders/delete',
  async (id: string, thunkAPI) => {
    try {
      await customOrderApi.deleteCustomOrderApi(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- Slice ---

export const customOrderSlice = createSlice({
  name: 'customOrders',
  initialState,
  reducers: {
    resetCustomOrderState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCustomOrders.fulfilled, (state, action: PayloadAction<CustomOrder[]>) => {
        state.isLoading = false;
        state.customOrders = action.payload;
      })
      .addCase(getCustomOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(submitCustomOrder.fulfilled, (state, action: PayloadAction<CustomOrder>) => {
        state.customOrders.unshift(action.payload);
        state.message = "Request submitted!";
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<CustomOrder>) => {
        const index = state.customOrders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.customOrders[index] = action.payload;
        }
      })
      .addCase(initiateCustomPayment.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(initiateCustomPayment.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        const index = state.customOrders.findIndex((o) => o.id === action.payload);
        if (index !== -1) {
          state.customOrders[index].paymentStatus = "pending"; 
        }
        state.message = "STK Push sent! Please enter your PIN.";
      })
      .addCase(initiateCustomPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(cancelCustomOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.customOrders = state.customOrders.filter((o) => o.id !== action.payload);
      });
  },
});

export const { resetCustomOrderState } = customOrderSlice.actions;
export default customOrderSlice.reducer;