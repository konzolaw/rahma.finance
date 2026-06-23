import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { budgetsApi } from '@/lib/api/budgets';
import { CreateBudgetRequest } from '@/types';

export function useBudgets(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetsApi.list(filters),
    refetchInterval: 5000,
  });
}


export function useCreateOrUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetsApi.createOrUpdate(data),
    onSuccess: () => {
      toast.success('Budget updated');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update budget');
    },
  });
}
