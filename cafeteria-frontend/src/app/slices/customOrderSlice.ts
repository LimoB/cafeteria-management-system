import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as customOrderApi from '../../api/customOrders';
import { CustomOrder, CustomOrderRequest } from '../../types/customOrder.types';

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

export const fetchCustomOrders = createAsyncThunk(
  'customOrders/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await customOrderApi.getAllCustomOrders();
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
      const data = await customOrderApi.createCustomOrder(orderData);
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
      const data = await customOrderApi.updateCustomOrder(id, updateData);
      return data.data as CustomOrder;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const cancelCustomOrder = createAsyncThunk(
  'customOrders/delete',
  async (id: string, thunkAPI) => {
    try {
      await customOrderApi.deleteCustomOrder(id);
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
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomOrders.fulfilled, (state, action: PayloadAction<CustomOrder[]>) => {
        state.isLoading = false;
        state.customOrders = action.payload;
      })
      .addCase(fetchCustomOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(submitCustomOrder.fulfilled, (state, action: PayloadAction<CustomOrder>) => {
        state.customOrders.unshift(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<CustomOrder>) => {
        const index = state.customOrders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.customOrders[index] = action.payload;
        }
      })
      .addCase(cancelCustomOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.customOrders = state.customOrders.filter((o) => o.id !== action.payload);
      });
  },
});

export const { resetCustomOrderState } = customOrderSlice.actions;
export default customOrderSlice.reducer;