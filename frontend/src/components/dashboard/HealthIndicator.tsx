import { formatPercent, formatKsh } from '@/lib/formatters';

interface HealthIndicatorProps {
  label: string;
  value: string | number;
  status: 'green' | 'yellow' | 'red' | 'good' | 'warning' | 'critical';
  benchmark: string;
  formula?: string;
  inputs?: {
    numerator: string;
    denominator: string;
    label: string;
  };
}

/**
 * Health indicator for financial ratios (Savings Rate, DTI, etc.)
 */
export default function HealthIndicator({
  label,
  value,
  status,
  benchmark,
  formula,
  inputs
}: HealthIndicatorProps) {
  // Normalize status strings from API
  const normalizedStatus = status === 'good' ? 'green' : status === 'warning' ? 'yellow' : status === 'critical' ? 'red' : status;

  const getStatusColors = () => {
    switch (normalizedStatus) {
      case 'green':
        return {
          text: 'text-teal-400',
          bg: 'bg-teal-500',
          dot: 'bg-teal-400',
          light: 'bg-teal-500/10'
        };
      case 'yellow':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500',
          dot: 'bg-amber-400',
          light: 'bg-amber-500/10'
        };
      case 'red':
        return {
          text: 'text-red-400',
          bg: 'bg-red-500',
          dot: 'bg-red-400',
          light: 'bg-red-500/10'
        };
      default:
        return {
          text: 'text-gray-400',
          bg: 'bg-gray-500',
          dot: 'bg-gray-400',
          light: 'bg-gray-500/10'
        };
    }
  };

  const colors = getStatusColors();
  
  // Calculate width for the progress bar (cap at 100%)
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const widthPercent = Math.min(Math.max(numericValue, 0), 100);

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl border border-white/5 transition-all hover:border-white/10 ${colors.light}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <div className="flex flex-col">
            <span className="text-sm font-black text-white uppercase tracking-tight">{label}</span>
            {formula && (
              <span className="text-[9px] font-mono text-slate-500">{formula}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xl font-black font-mono leading-none ${colors.text}`}>
            {formatPercent(value)}
          </span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Target: {benchmark}
          </span>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bg}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      
      {inputs && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{inputs.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
            <span>{formatKsh(inputs.numerator)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatKsh(inputs.denominator)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
