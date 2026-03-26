import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as userApi from '../../api/users';
import { UserProfile, UserState } from '../../types/user.types';

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  isError: false,
  message: '',
};

// FETCH ALL (Now shows Admins correctly!)
export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await userApi.getAllUsers();
    // data.data now contains the combined array from your updated Service/Controller
    return data.data as UserProfile[];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to load directory");
  }
});

export const fetchUserProfile = createAsyncThunk('users/fetchOne', async (id: number, thunkAPI) => {
  try {
    const data = await userApi.getUserById(id);
    return data.data as UserProfile;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "User not found");
  }
});

export const updateProfile = createAsyncThunk(
  'users/update',
  async ({ id, userData }: { id: number; userData: Partial<UserProfile> }, thunkAPI) => {
    try {
      const response = await userApi.updateUser(id, userData);
      const updatedUser = response.data as UserProfile;

      // SYNC AUTH STATE IN LOCALSTORAGE
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        // We check ID to see if the person being updated is the one currently logged in
        if (authData.user && authData.user.id === id) {
          const newAuthData = {
            ...authData,
            user: { ...authData.user, ...updatedUser }
          };
          localStorage.setItem('auth', JSON.stringify(newAuthData));
        }
      }
      return updatedUser;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const removeUser = createAsyncThunk('users/delete', async (id: number, thunkAPI) => {
  try {
    await userApi.deleteUser(id);
    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Deletion failed");
  }
});

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserStatus: (state) => {
      state.isError = false;
      state.message = '';
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- FETCH ALL --- */
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<UserProfile[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* --- FETCH ONE --- */
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.selectedUser = action.payload;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })

      /* --- UPDATE --- */
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.message = "Record updated successfully";
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* --- DELETE --- */
      .addCase(removeUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      });
  },
});

export const { clearUserStatus } = userSlice.actions;
export default userSlice.reducer;