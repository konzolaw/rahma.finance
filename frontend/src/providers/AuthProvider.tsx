'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import axios from 'axios';

interface AuthProviderProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/offline'];

/**
 * Provider that handles initial session restoration.
 * If a refresh token exists in cookies, it attempts to fetch the user profile.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, logout } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const hydrateAuth = async () => {
      // Don't hydrate on public routes if not logged in
      const isLoggedIn = Cookies.get('is_logged_in') === 'true';
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (!isLoggedIn && isPublicRoute) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('[Auth Hydration] Attempting to fetch profile...');
        const response = await authApi.getMe();
        
        if (response.status === 'success' && response.data?.user) {
          console.log('[Auth Hydration] Profile fetched successfully');
          setUser(response.data.user);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('[Auth Hydration] Session invalid (401), logging out');
          logout();
          Cookies.remove('is_logged_in');
        } else {
          console.error('[Auth Hydration Error]', error);
        }
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, [setUser, setLoading, logout, pathname]);

  return <>{children}</>;
}
