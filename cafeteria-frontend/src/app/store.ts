import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import menuReducer from './slices/menuSlice';
import customOrderReducer from './slices/customOrderSlice';
import locationReducer from './slices/locationSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    customOrders: customOrderReducer,
    locations: locationReducer,
    orders: orderReducer,
    payments: paymentReducer,
    users: userReducer,
    cart: cartReducer, // 2. Register it here
    admin: adminReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;