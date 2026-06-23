import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
  ) },
  { href: '/expenses', label: 'Expenses', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8V4m0 0L8 8m4-4l4 4M4 12h16M4 16h16M4 20h16"/></svg>
  ) },
  { href: '/income', label: 'Income', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 16v4m0 0l-4-4m4 4l4-4M4 12h16M4 8h16M4 4h16"/></svg>
  ) },
  { href: '/savings', label: 'Savings', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  ) },
  { href: '/insights', label: 'Insights', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ) },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow flex justify-around h-16 max-w-2xl mx-auto w-full">
      {nav.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${active ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'}`}
            aria-current={active ? 'page' : undefined}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
