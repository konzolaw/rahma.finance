'use client';

import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';

/**
 * Global application header
 * Displays current section title and user greeting
 */
export default function AppHeader() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/savings') return 'Savings & Portfolio';
    if (pathname === '/budget') return 'Budget Planner';
    if (pathname === '/add') return 'New Transaction';
    if (pathname === '/profile') return 'My Profile';
    if (pathname.includes('/expenses')) return 'Expense Details';
    if (pathname === '/income') return 'Income Details';
    if (pathname === '/insights') return 'Financial Insights';
    return 'Kenya Finance';
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#0B1121]/80 backdrop-blur-lg px-5 py-4 border-b border-white/5">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <div className="flex flex-col">
          <h1 className="text-lg font-extrabold tracking-tight text-white">
            {getPageTitle()}
          </h1>
          {pathname === '/dashboard' && user && (
            <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
              Habari, {user.display_name || 'Mteja'}! 👋
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-500 transition-colors active:bg-teal-600/20"
            aria-label="Notifications"
          >
            <span className="text-lg">🔔</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0B1121] flex items-center justify-center text-xs font-black uppercase tracking-widest overflow-hidden text-teal-400">
              {user?.display_name?.substring(0, 2) || 'KY'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
