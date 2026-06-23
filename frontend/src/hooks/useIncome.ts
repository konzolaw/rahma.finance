import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeApi } from '@/lib/api/income';
import { toast } from 'sonner';
import { ApiResponse, PaginatedResponse, IncomeEntry } from '@/types';

export function useIncome(params?: Record<string, any>, options: any = {}) {
  return useQuery<ApiResponse<PaginatedResponse<IncomeEntry>>>({
    queryKey: ['income', params],
    queryFn: () => incomeApi.list(params),
    refetchInterval: 5000,
    ...options
  });
}


export function useIncomeSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['income', 'summary', month, year],
    queryFn: () => incomeApi.getSummary({ month, year }),
    refetchInterval: 5000,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Income recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record income');
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Income updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update income');
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Income deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete income');
    },
  });
}
