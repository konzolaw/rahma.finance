import apiClient from './client';
import { ApiResponse } from '@/types';

export const savingsApi = {
  list: async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/investments/', { params });
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/investments/', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/investments/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/investments/${id}/`);
  },

  getSummary: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/investments/summary/');
    return response.data;
  },
};
