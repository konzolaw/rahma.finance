import { formatKsh } from '@/lib/formatters';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  colorScheme: 'income' | 'expense' | 'savings' | 'portfolio';
  subValue?: string;
  subLabel?: string;
  periodLabel?: string;
  onClick?: () => void;
}


/**
 * Premium Summary card for displaying high-level metrics
 */
export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  colorScheme,
  periodLabel = 'Current Month',
  subValue,
  subLabel,
  onClick,
}: SummaryCardProps) {

  const getColors = () => {
    switch (colorScheme) {
      case 'income':
        return {
          glow: 'glow-emerald',
          text: 'text-emerald-400',
          iconBg: 'bg-emerald-500/20',
          indicator: 'bg-emerald-500',
        };
      case 'expense':
        return {
          glow: 'glow-red',
          text: 'text-red-400',
          iconBg: 'bg-red-500/20',
          indicator: 'bg-red-500',
        };
      case 'savings':
        return {
          glow: 'glow-teal',
          text: 'text-teal-400',
          iconBg: 'bg-teal-500/20',
          indicator: 'bg-teal-500',
        };
      case 'portfolio':
        return {
          glow: 'glow-blue',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
          indicator: 'bg-blue-500',
        };
      default:
        return {
          glow: '',
          text: 'text-white',
          iconBg: 'bg-white/10',
          indicator: 'bg-white',
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 glass-card group hover:scale-[1.01] transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      
      <div className="flex justify-between items-start mb-4 relative z-10">

        <div className="flex flex-col">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</h3>
          <div className={`w-6 h-1 rounded-full ${colors.indicator} opacity-50`} />
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${colors.iconBg} ${colors.text} transform group-hover:rotate-12 transition-transform`}>
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col relative z-10">
        <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight mb-1 truncate">
          {formatKsh(value)}
        </span>

        {subValue && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{subLabel}:</span>
            <span className={`text-[11px] font-mono font-black ${colors.text}`}>{formatKsh(subValue)}</span>
          </div>
        )}
        
        {trend ? (
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className={`flex items-center px-1.5 py-0.5 rounded-md ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
            <span className="text-zinc-500 uppercase">{trend.label}</span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{periodLabel}</span>
        )}
      </div>
    </div>
  );
}
