import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { savingsApi } from '@/lib/api/savings';
import { vaultApi, CreateVaultRequest } from '@/lib/api/vault';
import { ApiResponse, PaginatedResponse, SavingsEntry, VaultTransaction } from '@/types';

// Investments (Formerly Savings)
export function useInvestments(filters?: Record<string, any>, options: any = {}) {
  return useQuery<ApiResponse<PaginatedResponse<SavingsEntry>>>({
    queryKey: ['investments', filters],
    queryFn: () => savingsApi.list(filters),
    refetchInterval: 5000,
    ...options
  });
}

export function useInvestmentSummary() {
  return useQuery({
    queryKey: ['investment-summary'],
    queryFn: () => savingsApi.getSummary(),
    refetchInterval: 5000,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => savingsApi.create(data),
    onSuccess: () => {
      toast.success('Investment entry created');
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create investment entry');
    },
  });
}

// Vault
export function useVault(filters?: Record<string, any>, options: any = {}) {
  return useQuery<ApiResponse<VaultTransaction[]>>({
    queryKey: ['vault', filters],
    queryFn: () => vaultApi.list(filters),
    refetchInterval: 5000,
    ...options
  });
}

export function useVaultBalance() {
  return useQuery({
    queryKey: ['vault-balance'],
    queryFn: () => vaultApi.getBalance(),
    refetchInterval: 5000,
  });
}

export function useCreateVaultTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVaultRequest) => vaultApi.create(data),
    onSuccess: () => {
      toast.success('Vault movement recorded');
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['vault-balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record vault movement');
    },
  });
}

// Keep old names as aliases for now to avoid breaking other files
export { useInvestments as useSavings };
export { useInvestmentSummary as useSavingsSummary };
export { useCreateInvestment as useCreateSavings };
export function useUpdateSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => savingsApi.update(id, data),
    onSuccess: () => {
      toast.success('Investment updated');
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savingsApi.delete(id),
    onSuccess: () => {
      toast.success('Investment deleted');
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
