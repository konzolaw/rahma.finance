'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incomeApi } from '@/lib/api/income';
import { IncomeEntry } from '@/types';
import IncomeRow from '@/components/income/IncomeRow';
import { formatKsh, formatPercent } from '@/lib/formatters';
import { ArrowUpCircle, TrendingUp, Calendar, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function IncomePage() {
  const [currentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: listResponse, isLoading: isLoadingList } = useQuery({
    queryKey: ['income', 'list', month, year],
    queryFn: () => incomeApi.list({ month, year }),
  });

  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['income', 'summary', month, year],
    queryFn: () => incomeApi.getSummary({ month, year }),
  });

  const incomeEntries: IncomeEntry[] = listResponse?.data?.results || [];
  const summary = summaryResponse?.data || {
    total_actual: '0',
    total_expected: '0',
    entries_count: 0,
    by_source: {}
  };

  const isLoading = isLoadingList || isLoadingSummary;

  // Calculate variance
  const actual = parseFloat(summary.total_actual || '0');
  const expected = parseFloat(summary.total_expected || '0');
  const variance = actual - expected;
  const variancePercent = expected > 0 ? (variance / expected) * 100 : 0;

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Summary */}
      <section className="glass-card rounded-[2.5rem] border border-white/5 shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-20 -mt-20" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">Monthly Earnings</span>
            <h2 className="text-4xl font-black text-white font-mono tracking-tighter">
              {formatKsh(summary.total_actual)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${variance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {variance >= 0 ? '+' : ''}{formatPercent(variancePercent)}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">vs Expected</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <ArrowUpCircle size={32} />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Expected</span>
            <span className="text-lg font-black text-white/80 font-mono">{formatKsh(summary.total_expected)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Variance</span>
            <span className={`text-lg font-black font-mono ${variance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {variance >= 0 ? '+' : ''}{formatKsh(variance)}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-white/5 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Top Source</span>
            <span className="text-sm font-black text-white truncate">
              {Object.keys(summary.by_source || {}).sort((a, b) => parseFloat(summary.by_source[b]) - parseFloat(summary.by_source[a]))[0] || 'N/A'}
            </span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-white/5 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Entries</span>
            <span className="text-sm font-black text-white">{summary.entries_count} this month</span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recent Income</h3>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
              <Filter size={14} />
            </button>
            <Link href="/add" className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus size={16} />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : incomeEntries.length > 0 ? (
          <div className="space-y-1">
            {incomeEntries.map(income => (
              <IncomeRow 
                key={income.id} 
                income={income} 
                onClick={() => {}} 
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 border border-white/5 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <ArrowUpCircle size={32} />
            </div>
            <p className="text-slate-500 font-bold text-sm">No income recorded yet.</p>
            <Link href="/add" className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
              Add first entry →
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}
