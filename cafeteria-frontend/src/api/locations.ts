import api from './axios';
import { LocationResponse, Location } from '../types/location.types';

// Students & Admins: View available pickup points
export const getLocations = async (): Promise<LocationResponse> => {
  const response = await api.get('/locations');
  return response.data;
};

// Admin Only: Add a new location
export const createLocation = async (name: string): Promise<LocationResponse> => {
  const response = await api.post('/locations', { name });
  return response.data;
};

// Admin Only: Delete a location
export const deleteLocation = async (id: number): Promise<LocationResponse> => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};