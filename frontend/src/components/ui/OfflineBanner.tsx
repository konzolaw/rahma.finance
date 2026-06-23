'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline } = useOnlineStatus();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isOnline) return null;

  return (
    <div className="bg-red-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 fixed top-0 w-full z-50 shadow-md animate-in slide-in-from-top-full duration-300">
      <WifiOff size={14} />
      <span>⚡ You are offline — showing cached data</span>
    </div>
  );
}
