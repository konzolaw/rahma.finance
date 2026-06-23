'use client';

// No React import needed
import Link from 'next/link';
import { WifiOff, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
        <WifiOff size={48} />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-3">You're Offline</h1>
      
      <p className="text-gray-400 mb-8 max-w-[280px]">
        It looks like you've lost your internet connection. Your last-saved data is available while you're offline.
      </p>

      <Link 
        href="/dashboard"
        className="flex items-center justify-center gap-2 w-full max-w-[280px] bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
      >
        <Home size={20} />
        Return to Dashboard
      </Link>
    </div>
  );
}
