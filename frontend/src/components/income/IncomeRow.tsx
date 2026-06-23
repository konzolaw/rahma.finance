'use client';

import { Landmark, Wallet, Briefcase, TrendingUp, ShoppingBag, PieChart, Banknote } from 'lucide-react';
import { IncomeEntry } from '@/types';
import { formatKsh, formatDayShort, formatMonthShort } from '@/lib/formatters';

interface IncomeRowProps {
  income: IncomeEntry;
  onClick: (income: IncomeEntry) => void;
}

/**
 * Reusable row for displaying a single income entry
 */
export default function IncomeRow({ income, onClick }: IncomeRowProps) {
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'salary': return <Briefcase size={16} className="text-emerald-400" />;
      case 'freelance': return <TrendingUp size={16} className="text-teal-400" />;
      case 'business': return <Landmark size={16} className="text-blue-400" />;
      case 'trading': return <PieChart size={16} className="text-purple-400" />;
      case 'dividends': return <Wallet size={16} className="text-amber-400" />;
      case 'side_hustles': return <ShoppingBag size={16} className="text-pink-400" />;
      default: return <Banknote size={16} className="text-emerald-400" />;
    }
  };

  const dayName = formatDayShort(income.date);
  const dayNum = new Date(income.date).getDate();
  const monthName = formatMonthShort(income.date);

  return (
    <div 
      onClick={() => onClick(income)}
      className="flex items-center justify-between p-4 bg-[#1f2d5c]/40 hover:bg-[#1f2d5c]/60 border border-white/5 rounded-2xl transition-all cursor-pointer mb-3 group"
    >
      <div className="flex items-center gap-4">
        {/* Date Block */}
        <div className="flex flex-col items-center justify-center min-w-[3rem] text-center border-r border-white/10 pr-3">
          <span className="text-[10px] uppercase text-slate-500 font-black tracking-wider">{dayName}</span>
          <span className="text-lg font-black text-white leading-none">{dayNum}</span>
          <span className="text-[10px] text-slate-500 font-bold">{monthName}</span>
        </div>

        {/* Details Block */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
              {income.description || 'Income Entry'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
              {getSourceIcon(income.source)}
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                {income.source.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end">
        <span className="text-base font-black font-mono text-emerald-400">
          +{formatKsh(income.actual_amount)}
        </span>
        {parseFloat(income.expected_amount) > 0 && (
          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-bold ${
              parseFloat(income.actual_amount) >= parseFloat(income.expected_amount) 
                ? 'text-emerald-500/60' 
                : 'text-amber-500/60'
            }`}>
              {Math.round((parseFloat(income.actual_amount) / parseFloat(income.expected_amount)) * 100)}% of target
            </span>
            <div className={`w-1 h-1 rounded-full ${
              parseFloat(income.actual_amount) >= parseFloat(income.expected_amount) 
                ? 'bg-emerald-500' 
                : 'bg-amber-500'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
}
