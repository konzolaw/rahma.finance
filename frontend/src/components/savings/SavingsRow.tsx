import { formatKsh } from '@/lib/formatters';
import { SavingsEntry } from '@/types';
import { Building2, Landmark, Coins, Briefcase, Edit2 } from 'lucide-react';

interface SavingsRowProps {
  savings: SavingsEntry;
  onEdit?: () => void;
}

/**
 * Premium row for individual savings items
 */
export default function SavingsRow({ savings, onEdit }: SavingsRowProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sacco': return <Building2 size={18} />;
      case 'stocks': return <TrendingUp size={18} />;
      case 'crypto': return <Coins size={18} />;
      case 'mmf': return <Landmark size={18} />;
      default: return <Briefcase size={18} />;
    }
  };

  const profitLoss = parseFloat(savings.current_value.toString()) - parseFloat(savings.amount_contributed.toString());
  const isProfit = profitLoss >= 0;

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5 mb-3 hover:border-teal-500/30 transition-all active:scale-[0.99] group relative">
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute right-4 top-0 -translate-y-1/2 bg-[#0B1121] border border-white/10 p-1.5 rounded-lg text-slate-500 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10"
          title="Edit Investment"
        >
          <Edit2 size={12} />
        </button>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-teal-400 transition-colors">
            {getIcon(savings.investment_type)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-tight">{savings.institution}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{savings.investment_type.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-sm font-black text-white font-mono">{formatKsh(savings.current_value)}</span>
          <div className={`text-[10px] font-black font-mono ${isProfit ? 'text-emerald-500' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatKsh(profitLoss)}
          </div>
        </div>
      </div>
      
      {/* Mini Progress Bar if goal exists */}
      {savings.goal_target && (
        <div className="mt-3 pt-3 border-t border-white/[0.03]">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">
            <span>Goal Progress</span>
            <span>{Math.round((parseFloat(savings.current_value.toString()) / parseFloat(savings.goal_target.toString())) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${Math.min((parseFloat(savings.current_value.toString()) / parseFloat(savings.goal_target.toString())) * 100, 100)}%` }} 
            />
          </div>
          {(() => {
            const target = parseFloat(savings.goal_target.toString());
            const current = parseFloat(savings.current_value.toString());
            const contributed = parseFloat(savings.amount_contributed.toString());
            if (current < target && contributed > 0) {
              // Heuristic: estimate monthly rate based on total contributions assuming 6 months avg age
              const estimatedMonthlyRate = contributed / 6;
              const monthsLeft = Math.ceil((target - current) / estimatedMonthlyRate);
              return (
                <div className="text-[9px] text-slate-500 font-bold flex justify-between items-center">
                  <span>Estimated Time to Goal:</span>
                  <span className="text-blue-400">~{monthsLeft} months</span>
                </div>
              );
            } else if (current >= target) {
              return (
                <div className="text-[9px] text-emerald-500 font-bold text-right uppercase tracking-widest">
                  Goal Achieved 🎉
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}

// Support function for the icon
function TrendingUp({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
