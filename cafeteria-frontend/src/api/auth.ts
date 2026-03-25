import api from './axios';
import { LoginCredentials, RegisterData, AuthResponse, ResetPasswordData } from '../types/auth.types';

// credentials = { username, password, isAdmin }
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterData): Promise<any> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPassword = async (username: string): Promise<any> => {
  const response = await api.post('/auth/forgot-password', { username });
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData): Promise<any> => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};