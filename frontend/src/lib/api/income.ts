import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Income API methods
 */
export const incomeApi = {
  /**
   * List income entries
   */
  list: async (params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await apiClient.get('/income/', { params });
    return response.data;
  },

  /**
   * Create new income entry
   */
  create: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/income/', data);
    return response.data;
  },

  /**
   * Update income entry
   */
  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/income/${id}/`, data);
    return response.data;
  },

  /**
   * Delete income entry
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/income/${id}/`);
  },

  /**
   * Get income summary
   */
  getSummary: async (params?: { month?: number; year?: number }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/income/summary/', { params });
    return response.data;
  },
};
