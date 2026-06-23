'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { formatPercent } from '@/lib/formatters';

interface RatioCardProps {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  benchmark: string;
  tip: string;
}

export default function RatioCard({ label, value, status, benchmark, tip }: RatioCardProps) {
  const [showTip, setShowTip] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'good':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'warning':
        return { color: 'text-amber-400', bg: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'critical':
        return { color: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500', badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const config = getStatusConfig();
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Progress bar logic (cap at 100 for visual, or 200 if it's an over-limit ratio like DTI)
  // We'll normalize to 100% max for the bar width
  const widthPercent = Math.min(numericValue, 100);

  return (
    <div className="bg-[#1f2d5c]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-gray-200">{label}</h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
          {status}
        </span>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className={`text-3xl font-mono font-bold tracking-tight ${config.color}`}>
          {formatPercent(value)}
        </span>
      </div>

      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.bg}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Target</span>
        <span className="text-[10px] text-gray-400 font-mono">{benchmark}</span>
      </div>

      <div className="mt-auto pt-3 border-t border-white/5">
        <button 
          onClick={() => setShowTip(!showTip)}
          className="flex items-center justify-between w-full text-xs text-teal-400 font-medium hover:text-teal-300 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb size={14} />
            <span>View Recommendation</span>
          </div>
          {showTip ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showTip && (
          <div className="mt-3 bg-teal-900/30 border border-teal-500/20 rounded-xl p-3 text-sm text-teal-100/90 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
            {tip}
          </div>
        )}
      </div>
    </div>
  );
}
