import api from './axios';
import { MenuResponse, MenuItem } from '../types/menu.types';

// Public: Get all menu items
export const getMenu = async (): Promise<MenuResponse<MenuItem[]>> => {
  const response = await api.get('/menu');
  return response.data;
};

// Public: Get single item
export const getMenuItem = async (id: number): Promise<MenuResponse<MenuItem>> => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};

// Admin: Create item (Expects FormData for image upload)
export const createMenuItem = async (formData: FormData): Promise<MenuResponse<MenuItem>> => {
  const response = await api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Admin: Update item (Expects FormData if changing image)
export const updateMenuItem = async (id: number, formData: FormData): Promise<MenuResponse<MenuItem>> => {
  const response = await api.patch(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Admin: Delete item
export const deleteMenuItem = async (id: number): Promise<MenuResponse<void>> => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};