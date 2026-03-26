import api from './axios';
import { UserResponse, UserProfile } from '../types/user.types';

/**
 * Admin: Get all Personnel (Combined Students & Admins from Backend)
 */
export const getAllUsers = async (): Promise<UserResponse> => {
  const response = await api.get('/users');
  return response.data;
};

/**
 * User/Admin: Get profile by ID
 */
export const getUserById = async (id: number): Promise<UserResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

/**
 * User/Admin: Update profile (Note: Backend handles if it's an Admin or Student)
 */
export const updateUser = async (id: number, userData: Partial<UserProfile>): Promise<UserResponse> => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

/**
 * Admin: Delete user from the registry
 */
export const deleteUser = async (id: number): Promise<UserResponse> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};