import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse {
  products: Product[];
  next_cursor: string | null;
  snapshot: string;
  has_more: boolean;
}

export const fetchProducts = async (
  category: string | null,
  cursor: string | null,
  snapshot: string | null
): Promise<PaginatedResponse> => {
  const params: Record<string, string | number> = { limit: 20 };
  
  if (category) params.category = category;
  if (cursor) params.cursor = cursor;
  if (snapshot) params.snapshot = snapshot;

  const response = await axios.get<PaginatedResponse>(`${API_URL}/products`, { params });
  return response.data;
};
