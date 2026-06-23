import apiClient from './client';
import { ExpenseEntry, CreateExpenseRequest, UpdateExpenseRequest, PaginatedResponse, ApiResponse } from '@/types';

/**
 * Expense API methods
 */
export const expensesApi = {
  /**
   * List expenses with filters
   */
  list: async (params?: Record<string, any>): Promise<ApiResponse<PaginatedResponse<ExpenseEntry>>> => {
    const response = await apiClient.get('/expenses/', { params });
    return response.data;
  },

  /**
   * Create new expense
   */
  create: async (data: CreateExpenseRequest): Promise<ApiResponse<ExpenseEntry>> => {
    const response = await apiClient.post('/expenses/', data);
    return response.data;
  },

  /**
   * Update existing expense
   */
  update: async (id: string, data: UpdateExpenseRequest): Promise<ApiResponse<ExpenseEntry>> => {
    const response = await apiClient.patch(`/expenses/${id}/`, data);
    return response.data;
  },

  /**
   * Delete expense
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}/`);
  },

  /**
   * Get expense summary for a month
   */
  getSummary: async (params?: { month?: number; year?: number }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/expenses/summary/', { params });
    return response.data;
  },
};
