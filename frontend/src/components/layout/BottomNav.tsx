'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Plus, Target, User } from 'lucide-react';
import QuickAddMenu from './QuickAddMenu';

/**
 * Premium Mobile-first bottom navigation bar with Quantum Add Menu integration
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'Insights', path: '/insights', icon: <TrendingUp size={22} /> },
    { label: 'Quantum', path: '#', icon: <Plus size={32} />, isMain: true },
    { label: 'Budget', path: '/budget', icon: <Target size={22} /> },
    { label: 'Profile', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1121]/80 backdrop-blur-xl border-t border-white/[0.05] pb-safe-area shadow-[0_-10px_40px_rgba(0,0,0,0.4)] z-50">
        <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            if (item.isMain) {
              return (
                <button
                  key="quantum-btn"
                  onClick={() => setIsMenuOpen(true)}
                  className="relative -top-6 flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-[2rem] shadow-[0_8px_20px_rgba(45,212,191,0.3)] border-4 border-[#0B1121] transition-all hover:scale-110 active:scale-95 group overflow-hidden"
                  aria-label="Open Quantum Menu"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-white transform group-hover:rotate-90 transition-transform duration-300">
                    {item.icon}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex flex-col items-center justify-center w-16 h-16 transition-all duration-300 group ${
                  isActive ? 'text-teal-400 scale-110' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`mb-1 transition-transform ${isActive ? 'translate-y-[-2px]' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest transition-all opacity-80 group-hover:opacity-100 mt-1">
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-teal-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* The fanned out menu */}
      <QuickAddMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
