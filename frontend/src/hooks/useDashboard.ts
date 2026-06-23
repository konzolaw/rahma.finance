import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { ApiResponse, DashboardSummary, BudgetVsActualResponse, InsightsData } from '@/types';

/**
 * Hook to fetch the main monthly dashboard summary
 */
export function useMonthlyDashboard(month?: number, year?: number, day?: number, period: string = 'month') {
  return useQuery<ApiResponse<DashboardSummary>>({
    queryKey: ['dashboard-summary', month, year, day, period],
    queryFn: () => dashboardApi.getDashboard({ month, year, day, period }),
    staleTime: 300000, // 5 minutes
  });
}


/**
 * Hook to fetch budget vs actual comparison
 */
export function useBudgetVsActual(month?: number, year?: number, day?: number, period: string = 'month') {
  return useQuery<BudgetVsActualResponse>({
    queryKey: ['budget-vs-actual', month, year, day, period],
    queryFn: () => dashboardApi.getBudgetVsActual({ month, year, day, period }),
    staleTime: 300000,
  });
}


/**
 * Hook to fetch financial insights
 */
export function useInsights(month?: number, year?: number) {
  return useQuery<ApiResponse<InsightsData>>({
    queryKey: ['insights', month, year],
    queryFn: () => dashboardApi.getInsights({ month, year }),
    staleTime: 300000,
  });
}
/**
 * Hook to fetch formal financial statement
 */
export function useStatement(month?: number, year?: number, day?: number, period: string = 'month', options: any = {}) {
  return useQuery<ApiResponse<any>>({
    queryKey: ['statement', month, year, day, period],
    queryFn: () => dashboardApi.getStatement({ month, year, day, period }),
    staleTime: 300000,
    ...options
  });
}

/**
 * Hook to fetch AI-driven financial analysis
 */
export function useAIAnalysis(month?: number, year?: number, day?: number, period: string = 'month', options: any = {}) {
  return useQuery<ApiResponse<any>>({
    queryKey: ['ai-analysis', month, year, day, period],
    queryFn: () => dashboardApi.getAIAnalysis({ month, year, day, period }),
    staleTime: 60000, 
    ...options
  });
}










