import api from './axios';
import { MenuResponse, MenuItem } from '../types/menu.types';

// Public: Get all menu items
export const getMenu = async (): Promise<MenuResponse> => {
  const response = await api.get('/menu');
  return response.data;
};

/**
 * Updated to use MenuItem in the return type 
 * so your components know exactly what an 'item' looks like.
 */
export const getMenuItem = async (id: number): Promise<MenuItem> => {
  const response = await api.get(`/menu/${id}`);
  // Extracting .data directly for cleaner consumption in thunks
  return response.data.data; 
};

// Admin: Create item (Expects FormData for image upload)
export const createMenuItem = async (formData: FormData): Promise<MenuItem> => {
  const response = await api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// Admin: Update item (Expects FormData if changing image)
export const updateMenuItem = async (id: number, formData: FormData): Promise<MenuItem> => {
  const response = await api.patch(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// Admin: Delete item
export const deleteMenuItem = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};