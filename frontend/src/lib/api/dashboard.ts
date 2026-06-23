import apiClient from './client';
import { DashboardSummary, InsightsData, ApiResponse, BudgetVsActualResponse } from '@/types';

/**
 * Dashboard API methods
 */
export const dashboardApi = {
  /**
   * Get full dashboard summary
   */
  getDashboard: async (params?: { month?: number; year?: number; day?: number; period?: string }): Promise<ApiResponse<DashboardSummary>> => {
    const response = await apiClient.get('/dashboard/summary/', { params });
    return response.data;
  },


  /**
   * Get budget vs actual summary
   */
  getBudgetVsActual: async (params?: { month?: number; year?: number; day?: number; period?: string }): Promise<BudgetVsActualResponse> => {
    const response = await apiClient.get('/dashboard/budgets/', { params });
    return response.data;
  },


  /**
   * Get financial insights
   */
  getInsights: async (params?: { month?: number; year?: number }): Promise<ApiResponse<InsightsData>> => {
    const response = await apiClient.get('/insights/all/', { params });
    return response.data;
  },

  /**
   * Get historical trends
   */
  getTrends: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/insights/trends/');
    return response.data;
  },

  /**
   * Get all category budgets
   */
  getBudgets: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/budgets/');
    return response.data;
  },

  /**
   * Update a specific category budget
   */
  updateBudget: async (category: string, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/budgets/${category}/`, data);
    return response.data;
  },
  
  /**
   * Get formal financial statement
   */
  getStatement: async (params?: { month?: number; year?: number; day?: number; period?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/dashboard/statement/', { params });
    return response.data;
  },

  /**
   * Get AI-driven financial analysis from FinBERT ML service
   */
  getAIAnalysis: async (params?: { month?: number; year?: number; day?: number; period?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/dashboard/ai-analysis/', { params });
    return response.data;
  },




  /**
   * Get AI advisor market database
   */
  getAdvisorMarketData: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/insights/advisor/');
    return response.data;
  },

  /**
   * Get compounding and tax simulation results
   */
  getAdvisorSimulation: async (data: { amount: number; currency: string; period_years: number; rate: number; asset_type: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/insights/advisor/', data);
    return response.data;
  },

  /**
   * Get AI advice based on prompt
   */
  getAdvisorAdvice: async (prompt: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/insights/advisor/', { prompt });
    return response.data;
  },
};
