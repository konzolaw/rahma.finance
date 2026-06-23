'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';

/**
 * Main application layout for authenticated users
 * Includes global header and bottom navigation
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // Route protection logic
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state (while checking auth)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-teal-500 text-sm font-medium animate-pulse">Initializing KeshoKwako...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of content if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#1B2A4A] pb-24">
      <AppHeader />
      
      <main className="max-w-2xl w-full mx-auto px-5 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
