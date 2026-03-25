export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  // Standardized to match your Drizzle schema "register_number"
  registerNumber: string; 
  department: string;
  username: string;
  graduationYear: number;
  role: 'user' | 'admin';
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: UserProfile | UserProfile[];
}

export interface UserState {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}