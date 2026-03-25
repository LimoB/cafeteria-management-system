import api from './axios';
import { UserResponse, UserProfile } from '../types/user.types';

// Admin: Get all students
export const getAllUsers = async (): Promise<UserResponse> => {
  const response = await api.get('/users');
  return response.data;
};

// User/Admin: Get profile by ID
export const getUserById = async (id: number): Promise<UserResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// User/Admin: Update profile (Name, Email, etc.)
export const updateUser = async (id: number, userData: Partial<UserProfile>): Promise<UserResponse> => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (id: number): Promise<UserResponse> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};