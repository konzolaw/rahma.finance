import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringApi } from '@/lib/api/recurring';
import { RecurringTransaction } from '@/types';
import { toast } from 'sonner';

export function useRecurring() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringApi.list(),
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RecurringTransaction>) => recurringApi.create(data),
    onSuccess: () => {
      toast.success('Recurring transaction created');
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create recurring transaction');
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecurringTransaction> }) => 
      recurringApi.update(id, data),
    onSuccess: () => {
      toast.success('Recurring transaction updated');
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onSuccess: () => {
      toast.success('Recurring transaction deleted');
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
