import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from '@/types';

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login/', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateMe: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch('/auth/me/', data);
    return response.data;
  },
};
