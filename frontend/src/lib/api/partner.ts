import apiClient from './client';
import { ApiResponse, PartnerInvite } from '@/types';

/**
 * Partner sharing API methods
 */
export const partnerApi = {
  /**
   * Send a partner invitation
   */
  invite: async (email: string): Promise<ApiResponse<PartnerInvite>> => {
    const response = await apiClient.post('/partners/invite/', { email });
    return response.data;
  },

  /**
   * List received pending invitations
   */
  getInvites: async (): Promise<ApiResponse<PartnerInvite[]>> => {
    const response = await apiClient.get('/partners/invites/');
    return response.data;
  },

  /**
   * Accept an invitation
   */
  acceptInvite: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/partners/${id}/accept/`);
    return response.data;
  },

  /**
   * Reject an invitation
   */
  rejectInvite: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/partners/${id}/reject/`);
    return response.data;
  },

  /**
   * Unlink current partner
   */
  unlink: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/partners/unlink/');
    return response.data;
  },
};
