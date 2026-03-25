export interface MenuItem {
  description: string;
  id: number;
  foodName: string;
  price: number;
  isAvailable: boolean;
  category: string | null;      
  imageUrl: string | null;      
  imagePublicId?: string | null;
  createdAt?: string;
}

/**
 * We use a generic 'T' here so that the 'data' property 
 * can be either an Array or a Single Object depending 
 * on the API call.
 */
export interface MenuResponse<T = MenuItem | MenuItem[]> {
  success: boolean;
  message?: string;
  data: T; 
}

export interface MenuState {
  items: MenuItem[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}