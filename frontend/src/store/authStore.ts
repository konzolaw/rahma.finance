/**
 * Zustand authentication store
 * Manages global auth state: access token, user profile, and auth status
 * 
 * CRITICAL (R053): Access token is stored IN-MEMORY ONLY.
 * It will be lost on page refresh and restored via the refresh token cookie.
 */

import { create } from 'zustand';
import { User } from '@/types';

export interface AuthStore {
  // State
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Set access token (In-memory only)
  setAccessToken: (token: string | null) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),

  // Set user profile
  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  // Set loading state
  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  // Set error message
  setError: (error: string | null) =>
    set({
      error,
    }),

  // Logout: clear token and user
  logout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  // Clear error message
  clearError: () =>
    set({
      error: null,
    }),
}));
