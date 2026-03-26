import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';
import { AuthState, LoginCredentials, AuthResponse, UserRole } from '../../types/auth.types';
// IMPORT the updateProfile thunk from your userSlice
import { updateProfile } from './userSlice'; 

// Helper to safely get data from localStorage on initialization
const getStoredData = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return key === 'user' ? JSON.parse(item) : item;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredData('user'),
  token: localStorage.getItem('token') || null, 
  role: (localStorage.getItem('role') as UserRole | null), 
  isLoading: false,
  isError: false,
  message: '',
};

export const login = createAsyncThunk(
  'auth/login', 
  async (userData: LoginCredentials, thunkAPI) => {
    try {
      const data = await authApi.loginUser(userData);
      
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        return data;
      }
      return thunkAPI.rejectWithValue("Login failed");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials. Please try again.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logoutUser();
  } catch (error) {
    console.warn("Server-side logout failed, clearing local session anyway.", error);
  } finally {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isError = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.token = action.payload.token || state.token; 
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
        state.role = null;
        state.token = null;
      })
      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      // --- THE FIX: SYNC WITH USER PROFILE UPDATES ---
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
        // If the updated user is the currently logged-in user, sync the data
        if (state.user && state.user.id === action.payload.id) {
          state.user = { ...state.user, ...action.payload };
          // Also update localStorage so a page refresh doesn't revert the phone number
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;