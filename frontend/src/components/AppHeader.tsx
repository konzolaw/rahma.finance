import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppHeader() {
  const pathname = usePathname();
  let title = 'Kenya Finance';
  if (pathname.startsWith('/expenses')) title = 'Expenses';
  else if (pathname.startsWith('/income')) title = 'Income';
  else if (pathname.startsWith('/savings')) title = 'Savings';
  else if (pathname.startsWith('/dashboard')) title = 'Dashboard';
  else if (pathname.startsWith('/insights')) title = 'Insights';
  else if (pathname.startsWith('/profile')) title = 'Profile';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm h-14 flex items-center px-4">
      <h1 className="font-bold text-lg tracking-tight flex-1 truncate">{title}</h1>
      <Link href="/profile" className="ml-2 rounded-full hover:bg-slate-100 p-1 transition-colors">
        <span className="sr-only">Profile</span>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-slate-500"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
      </Link>
    </header>
  );
}
