export interface Location {
  id: number;
  name: string;
  createdAt?: string;
}

export interface LocationResponse {
  success: boolean;
  message?: string;
  data: Location | Location[];
}

export interface LocationState {
  locations: Location[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}