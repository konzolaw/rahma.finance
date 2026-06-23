import apiClient from './client';
import { CategoryBudget, CreateBudgetRequest, PaginatedResponse, ApiResponse } from '@/types';

export const budgetsApi = {
  list: async (params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<CategoryBudget>>> => {
    const response = await apiClient.get('/budgets/', { params });
    return response.data;
  },

  createOrUpdate: async (data: CreateBudgetRequest): Promise<ApiResponse<CategoryBudget>> => {
    const response = await apiClient.post('/budgets/', data);
    return response.data;
  },

  getSummary: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/budgets/summary/');
    return response.data;
  },
};
