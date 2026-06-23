import apiClient from './client';
import { ApiResponse } from '@/types';

export interface VaultTransaction {
  id: string;
  date: string;
  type: 'save' | 'withdraw';
  type_display: string;
  amount: string;
  description: string;
  created_at: string;
}

export interface CreateVaultRequest {
  type: 'save' | 'withdraw';
  amount: number | string;
  description?: string;
  date?: string;
}

export const vaultApi = {
  list: async (params?: Record<string, any>): Promise<ApiResponse<VaultTransaction[]>> => {
    const response = await apiClient.get('/vault/', { params });
    return response.data;
  },

  create: async (data: CreateVaultRequest): Promise<ApiResponse<VaultTransaction>> => {
    const response = await apiClient.post('/vault/', data);
    return response.data;
  },

  getBalance: async (): Promise<ApiResponse<{ balance: string }>> => {
    const response = await apiClient.get('/vault/balance/');
    return response.data;
  },
};
