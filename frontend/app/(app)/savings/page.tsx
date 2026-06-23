'use client';

import { useState } from 'react';
import { Plus, BarChart3, TrendingUp } from 'lucide-react';
import { useSavings, useSavingsSummary } from '@/hooks/useSavings';
import PortfolioSummary from '@/components/savings/PortfolioSummary';
import SavingsRow from '@/components/savings/SavingsRow';
import SavingsForm from '@/components/savings/SavingsForm';
import { SavingsEntry } from '@/types';

export default function SavingsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSavings, setEditingSavings] = useState<SavingsEntry | null>(null);
  const { data: savingsData, isLoading: isLoadingSavings } = useSavings({ page_size: 100 });
  const { data: summaryData, isLoading: isLoadingSummary } = useSavingsSummary();

  const savings: SavingsEntry[] = savingsData?.data?.results || [];
  const summary = summaryData?.data || null;

  const groupedSavings = savings.reduce((acc, entry) => {
    const group = acc[entry.investment_type] || [];
    group.push(entry);
    acc[entry.investment_type] = group;
    return acc;
  }, {} as Record<string, SavingsEntry[]>);

  const isLoading = isLoadingSavings || isLoadingSummary;

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-64 glass-card rounded-[2.5rem] border border-white/5" />
          <div className="h-6 w-40 bg-gray-700 rounded-full my-4" />
          <div className="space-y-3">
            <div className="h-24 glass-card rounded-2xl" />
            <div className="h-24 glass-card rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {summary && (
            <PortfolioSummary 
              totalContributed={summary.total.contributed}
              currentValue={summary.total.current_value}
              profitLoss={summary.total.profit_loss}
              goalTarget={summary.total.goal_target}
              goalProgress={summary.total.goal_progress_percent}
              byType={summary.by_type}
            />
          )}

          {savings.length > 0 ? (
            <div className="space-y-10">
              {Object.entries(groupedSavings).map(([type, entries]) => (
                <div key={type} className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <BarChart3 size={16} />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {type.replace('_', ' ')} Allocation
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {entries.map(entry => (
                      <SavingsRow 
                        key={entry.id} 
                        savings={entry} 
                        onEdit={() => setEditingSavings(entry)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-teal-500/10 rounded-[2.5rem] flex items-center justify-center text-teal-500 mb-8 border border-teal-500/20">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Investment Portfolio</h3>
              <p className="text-sm text-gray-500 mb-10 max-w-[280px] leading-relaxed">
                Initialize your wealth journey by adding your first investment or emergency fund.
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black shadow-xl shadow-teal-900/40 transition-all active:scale-95"
              >
                START INVESTING
              </button>
            </div>
          )}
        </>
      )}

      {/* FAB - Adjusted for better visibility */}
      <button 
        className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.3)] border-4 border-[#0F172A] z-40 hover:scale-110 active:scale-90 transition-all group"
        onClick={() => setIsAddModalOpen(true)}
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal Overlay */}
      {(isAddModalOpen || editingSavings) && (
        <SavingsForm 
          initialData={editingSavings}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSavings(null);
          }} 
        />
      )}
    </div>
  );
}
