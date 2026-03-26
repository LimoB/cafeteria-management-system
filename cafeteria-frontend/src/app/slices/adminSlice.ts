import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Your Axios instance

export interface DashboardStats {
  orders: number;
  users: number;
  revenue: number;
  today: number;
}

interface AdminState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  isLoading: false,
  error: null,
};

// Async Thunk to fetch dashboard data
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      // Matches your controller response: { success: true, stats: { ... } }
      return response.data.stats;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;