export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  registerNumber?: string;
  department?: string;
  avatarUrl?: string | null;
}

// This is the missing piece causing the error
export interface AuthResponse {
  success: boolean;
  message?: string;
  role: UserRole;
  user: User;
  token?: string; // Optional since you are using httpOnly cookies
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  isAdmin: boolean;
}

// Adding this for your Registration flow too
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  username: string;
  password?: string;
  graduationYear: number;
}