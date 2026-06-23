import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { RegisterRequest } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const {
    accessToken,
    user,
    isAuthenticated,
    isLoading,
    error,
    setAccessToken,
    setUser,
    setLoading,
    setError,
    logout: logoutStore,
    clearError,
  } = useAuthStore();

  /**
   * Register a new user account
   */
  const register = useCallback(
    async (payload: RegisterRequest) => {
      setLoading(true);
      clearError();
      try {
        const response = await authApi.register(payload);
        // Register usually doesn't return tokens in our current setup, 
        // it requires a separate login call, which is handled in the page.
        // But if it does return data:
        if (response.status === 'success' && response.data) {
          const data = response.data as any;
          if (data.access_token) setAccessToken(data.access_token);
          if (data.user) setUser(data.user);
        }
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAccessToken, setUser, setLoading, setError, router, clearError]
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      clearError();
      try {
        const response = await authApi.login({ email, password });
        if (response.status === 'success' && response.data) {
          setAccessToken(response.data.access_token);
          setUser(response.data.user);
          router.push('/dashboard');
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAccessToken, setUser, setLoading, setError, router, clearError]
  );

  /**
   * Logout the current user
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      logoutStore();
      router.push('/login');
    }
  }, [logoutStore, router]);

  /**
   * Load user profile from API
   */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authApi.getMe();
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load profile.';
      setError(errorMessage);
      if (String(err).includes('401')) {
        logoutStore();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError, logoutStore, router]);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (payload: { display_name?: string; expected_monthly_income?: string }) => {
      setLoading(true);
      clearError();
      try {
        const response = await authApi.updateMe(payload as any);
        if (response.status === 'success' && response.data?.user) {
          setUser(response.data.user);
          return response.data.user;
        }
        return null;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile.';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError, clearError]
  );

  return {
    accessToken,
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    loadProfile,
    updateUserProfile,
    clearError,
  };
};
