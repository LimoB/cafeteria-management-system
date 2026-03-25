import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem } from '../../types/menu.types';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Adds an item to the tray. 
     * We explicitly cast price to a Number here to kill the 'NaN' bug 
     * before it reaches the Checkout phase.
     */
    addToCart: (state, action: PayloadAction<MenuItem>) => {
      const existingItem = state.items.find(
        (item) => Number(item.id) === Number(action.payload.id)
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // SANITIZATION: Ensure price is a valid number
        const safePrice = Number(action.payload.price);
        
        if (isNaN(safePrice)) {
          console.error(`Invalid price detected for item: ${action.payload.foodName}`);
          return; // Don't add broken items to the cart
        }

        state.items.push({ 
          ...action.payload, 
          price: safePrice, // Force it to be a number type
          quantity: 1 
        });
      }
    },

    decrementQuantity: (state, action: PayloadAction<number | string>) => {
      const existingItem = state.items.find(
        (item) => Number(item.id) === Number(action.payload)
      );

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) => Number(i.id) !== Number(action.payload)
          );
        }
      }
    },

    removeFromCart: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter(
        (item) => Number(item.id) !== Number(action.payload)
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
  addToCart, 
  decrementQuantity, 
  removeFromCart, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;