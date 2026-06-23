import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerApi } from '@/lib/api/partner';
import { toast } from 'sonner';

/**
 * Hook for managing partner sharing
 */
export function usePartner() {
  const queryClient = useQueryClient();

  const invitesQuery = useQuery({
    queryKey: ['partner-invites'],
    queryFn: () => partnerApi.getInvites(),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => partnerApi.invite(email),
    onSuccess: (response) => {
      if (response.status === 'success') {
        toast.success('Invitation sent successfully');
        queryClient.invalidateQueries({ queryKey: ['partner-invites'] });
      } else {
        toast.error(response.message || 'Failed to send invitation');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => partnerApi.acceptInvite(id),
    onSuccess: () => {
      toast.success('Partner linked successfully');
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      queryClient.invalidateQueries({ queryKey: ['partner-invites'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => partnerApi.rejectInvite(id),
    onSuccess: () => {
      toast.success('Invitation rejected');
      queryClient.invalidateQueries({ queryKey: ['partner-invites'] });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () => partnerApi.unlink(),
    onSuccess: () => {
      toast.success('Partner unlinked');
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  return {
    invites: invitesQuery.data?.data || [],
    isLoadingInvites: invitesQuery.isLoading,
    invitePartner: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    acceptInvite: acceptMutation.mutate,
    rejectInvite: rejectMutation.mutate,
    unlinkPartner: unlinkMutation.mutate,
  };
}
