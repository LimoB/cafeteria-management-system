import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as orderApi from '../../api/orders';
import { Order, OrderRequest, OrderStatus } from '../../types/order.types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isError: false,
  message: '',
};

// --- Thunks ---

/**
 * FETCH ORDERS: 
 * Smart Thunk that decides whether to fetch ALL (Admin) or MINE (Student)
 */
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll', 
  async (isAdmin: boolean = false, thunkAPI) => {
    try {
      // If user is Admin, call getAllOrders, else call getUserOrders
      const data = isAdmin 
        ? await orderApi.getAllOrders() 
        : await orderApi.getUserOrders();
      
      // Extract data array from backend { success: true, data: [...] }
      const orders = data.data || (Array.isArray(data) ? data : []);
      return orders as Order[];
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch orders";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * PLACE ORDER: Final check for data integrity before hitting API.
 */
export const placeOrder = createAsyncThunk(
  'orders/create', 
  async (orderData: OrderRequest, thunkAPI) => {
    try {
      // Ensure amount is a valid number
      const finalAmount = Number(orderData.amount);
      
      if (isNaN(finalAmount) || finalAmount <= 0) {
        return thunkAPI.rejectWithValue("Invalid order amount. Please refresh your tray.");
      }

      const sanitizedData: OrderRequest = {
          ...orderData,
          amount: finalAmount
      };

      const data = await orderApi.createOrder(sanitizedData);
      
      // Return the order object from the response
      return (data.order || data.data || data) as Order;
    } catch (error: any) {
      const message = error.response?.data?.message || "Order placement failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * UPDATE ORDER STATUS (Admin only)
 */
export const changeOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: string; status: OrderStatus }, thunkAPI) => {
    try {
      const data = await orderApi.updateOrderStatus(id, status);
      return (data.data || data) as Order;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// --- Slice ---

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderMessage: (state) => {
      state.isError = false;
      state.message = '';
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.orders.unshift(action.payload); // Add new order to the top of the list
        state.currentOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Update Status
      .addCase(changeOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { clearOrderMessage, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;