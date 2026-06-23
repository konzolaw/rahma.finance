import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expensesApi } from '@/lib/api/expenses';
import { CreateExpenseRequest, UpdateExpenseRequest, ApiResponse, PaginatedResponse, ExpenseEntry } from '@/types';

/**
 * Hook to fetch paginated/filtered expenses
 */
export function useExpenses(filters?: Record<string, any>, options: any = {}) {
  return useQuery<ApiResponse<PaginatedResponse<ExpenseEntry>>>({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.list(filters),
    refetchInterval: 5000,
    ...options
  });
}


/**
 * Hook to fetch monthly expense summary
 */
export function useExpenseSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ['expense-summary', month, year],
    queryFn: () => expensesApi.getSummary({ month, year }),
    refetchInterval: 5000,
  });
}


/**
 * Hook to create a new expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.create(data),
    onSuccess: () => {
      toast.success('Expense created successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create expense');
    },
  });
}

/**
 * Hook to update an existing expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) => expensesApi.update(id, data),
    onSuccess: () => {
      toast.success('Expense updated successfully');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update expense');
    },
  });
}

/**
 * Hook to delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete expense');
    },
  });
}
