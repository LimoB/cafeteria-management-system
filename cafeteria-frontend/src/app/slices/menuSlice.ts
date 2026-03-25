import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as menuApi from '../../api/menu';
import { MenuItem, MenuState, MenuResponse } from '../../types/menu.types';

const initialState: MenuState = {
  items: [],
  isLoading: false,
  isError: false,
  message: '',
};

// --- Thunks ---

export const fetchMenu = createAsyncThunk('menu/fetchAll', async (_, thunkAPI) => {
  try {
    // FIXED: Use 'as' to assert the specific type coming from the API
    const response = (await menuApi.getMenu()) as MenuResponse<MenuItem[]>;
    
    // Supporting both { success: true, data: [] } and a direct array response
    const menuData = response.data || response;
    return Array.isArray(menuData) ? (menuData as MenuItem[]) : [];
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to load menu";
    return thunkAPI.rejectWithValue(message);
  }
});

export const addMenuItem = createAsyncThunk('menu/add', async (formData: FormData, thunkAPI) => {
  try {
    // FIXED: Assert as a single MenuItem response
    const response = (await menuApi.createMenuItem(formData)) as MenuResponse<MenuItem>;
    
    const newItem = response.data || response;
    return newItem as MenuItem;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add item");
  }
});

export const editMenuItem = createAsyncThunk(
  'menu/update',
  async ({ id, formData }: { id: number; formData: FormData }, thunkAPI) => {
    try {
      // FIXED: Assert as a single MenuItem response
      const response = (await menuApi.updateMenuItem(id, formData)) as MenuResponse<MenuItem>;
      
      const updatedItem = response.data || response;
      return updatedItem as MenuItem;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const removeMenuItem = createAsyncThunk('menu/delete', async (id: number, thunkAPI) => {
  try {
    await menuApi.deleteMenuItem(id);
    return id; 
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Deletion failed");
  }
});

// --- Slice ---

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    resetMenuState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMenu.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(addMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.items.unshift(action.payload);
        state.message = "Item added successfully";
      })
      .addCase(editMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        const index = state.items.findIndex((item) => Number(item.id) === Number(action.payload.id));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.message = "Item updated successfully";
      })
      .addCase(removeMenuItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => Number(item.id) !== Number(action.payload));
        state.message = "Item removed successfully";
      });
  },
});

export const { resetMenuState } = menuSlice.actions;
export default menuSlice.reducer;