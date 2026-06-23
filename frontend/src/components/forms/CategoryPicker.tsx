import { ReactNode } from 'react';
import { 
  Utensils, 
  Bus, 
  Home, 
  Heart, 
  Gamepad2, 
  ShieldCheck, 
  CreditCard, 
  MoreHorizontal,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface CategoryPickerProps {
  onSelect: (type: 'expense' | 'income', categoryCode?: string) => void;
}

/**
 * Full-screen category picker for the Add Transaction flow
 */
export default function CategoryPicker({ onSelect }: CategoryPickerProps) {
  // Mapping categories to icons and specific colors
  const categoryConfig: Record<string, { icon: ReactNode, color: string, bg: string }> = {
    food: { icon: <Utensils size={28} />, color: 'text-green-400', bg: 'bg-green-500/10 hover:bg-green-500/20' },
    transport: { icon: <Bus size={28} />, color: 'text-orange-400', bg: 'bg-orange-500/10 hover:bg-orange-500/20' },
    housing: { icon: <Home size={28} />, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
    personal_care: { icon: <Heart size={28} />, color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20' },
    entertainment: { icon: <Gamepad2 size={28} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 hover:bg-yellow-500/20' },
    insurance: { icon: <ShieldCheck size={28} />, color: 'text-slate-400', bg: 'bg-slate-400/10 hover:bg-slate-400/20' }, 
    loans_debt: { icon: <CreditCard size={28} />, color: 'text-red-400', bg: 'bg-red-500/10 hover:bg-red-500/20' },
    additional: { icon: <MoreHorizontal size={28} />, color: 'text-teal-400', bg: 'bg-teal-500/10 hover:bg-teal-500/20' },
    miscellaneous: { icon: <Sparkles size={28} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20' },
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-300 pb-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">What are you adding?</h2>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Select a category to quickly log an entry.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {EXPENSE_CATEGORIES.filter(cat => cat.code !== 'savings').map((cat) => {
          const config = categoryConfig[cat.code];
          
          return (
            <button
              key={cat.code}
              onClick={() => onSelect('expense', cat.code)}
              className={`flex flex-col items-center justify-center p-4 h-32 rounded-3xl border border-white/5 shadow-lg transition-all active:scale-95 ${config?.bg || 'bg-white/5'}`}
            >
              <div className={`mb-3 ${config?.color || 'text-white'} drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}>
                {config?.icon || <MoreHorizontal size={28} />}
              </div>
              <span className="text-[10px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
          <span className="bg-[#0B1121] px-4 text-slate-500 font-black">Or add income</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => onSelect('income')}
          className="flex flex-col items-center justify-center p-5 h-32 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all active:scale-[0.98] text-emerald-400"
        >
          <div className="mb-3">
            <TrendingUp size={28} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Incoming</span>
        </button>
        
        <button
          onClick={() => (window.location.href = '/add?type=investment')}
          className="flex flex-col items-center justify-center p-5 h-32 rounded-[2rem] border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all active:scale-[0.98] text-purple-400"
        >
          <div className="mb-3">
            <TrendingUp size={28} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Investment</span>
        </button>

        <button
          onClick={() => (window.location.href = '/add?type=vault_save')}
          className="flex flex-col items-center justify-center p-5 h-32 rounded-[2rem] border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all active:scale-[0.98] text-amber-400 col-span-2"
        >
          <div className="mb-3">
            <ShieldCheck size={28} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Vault Movement</span>
        </button>
      </div>
    </div>
  );
}
