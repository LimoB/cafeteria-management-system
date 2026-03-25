import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as locationApi from '../../api/locations';
import { Location, LocationState } from '../../types/location.types';

const initialState: LocationState = {
  locations: [],
  isLoading: false,
  isError: false,
  message: '',
};

// --- Thunks ---

export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await locationApi.getLocations();
      return data.data as Location[];
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to load locations";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addNewLocation = createAsyncThunk(
  'locations/add',
  async (name: string, thunkAPI) => {
    try {
      const data = await locationApi.createLocation(name);
      return data.data as Location;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add location";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const removeLocation = createAsyncThunk(
  'locations/delete',
  async (id: number, thunkAPI) => {
    try {
      await locationApi.deleteLocation(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete location";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Slice ---

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    resetLocationState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Locations
      .addCase(fetchLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLocations.fulfilled, (state, action: PayloadAction<Location[]>) => {
        state.isLoading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Add Location
      .addCase(addNewLocation.fulfilled, (state, action: PayloadAction<Location>) => {
        state.locations.push(action.payload);
      })
      // Delete Location
      .addCase(removeLocation.fulfilled, (state, action: PayloadAction<number>) => {
        state.locations = state.locations.filter((loc) => loc.id !== action.payload);
      });
  },
});

export const { resetLocationState } = locationSlice.actions;
export default locationSlice.reducer;