import { formatKsh } from '@/lib/formatters';

interface BudgetGaugeProps {
  category: string;
  budget: string | number;
  actual: string | number;
  percentUsed: string | number;
  status: 'on_track' | 'warning' | 'exceeded' | 'near_limit' | 'over_budget';
}

/**
 * Budget gauge to show spending vs budget for a specific category
 */
export default function BudgetGauge({
  category,
  budget,
  actual,
  percentUsed,
  status,
}: BudgetGaugeProps) {
  // Normalize status strings
  const normalizedStatus = 
    status === 'exceeded' || status === 'over_budget' ? 'red' :
    status === 'warning' || status === 'near_limit' ? 'yellow' : 
    'green';

  const getStatusColors = () => {
    switch (normalizedStatus) {
      case 'green':
        return {
          bar: 'bg-teal-500',
          text: 'text-teal-400',
          emoji: '✅',
          label: 'On Track',
        };
      case 'yellow':
        return {
          bar: 'bg-amber-500',
          text: 'text-amber-400',
          emoji: '⚡',
          label: 'Near Limit',
        };
      case 'red':
        return {
          bar: 'bg-red-500',
          text: 'text-red-400',
          emoji: '⚠️',
          label: 'Over Budget',
        };
      default:
        return {
          bar: 'bg-gray-500',
          text: 'text-gray-400',
          emoji: '⚪',
          label: 'Unknown',
        };
    }
  };

  const colors = getStatusColors();
  
  // Calculate width for the progress bar (cap at 100%)
  const numericPercent = typeof percentUsed === 'string' ? parseFloat(percentUsed) : percentUsed;
  const widthPercent = Math.min(Math.max(numericPercent, 0), 100);

  return (
    <div className="bg-[#1f2d5c]/50 rounded-xl p-3 border border-white/5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-200 capitalize">
          {category}
        </span>
        <div className="flex items-center gap-1 bg-[#1B2A4A] px-2 py-0.5 rounded-full border border-white/10">
          <span className="text-[10px]">{colors.emoji}</span>
          <span className={`text-[10px] font-medium uppercase ${colors.text}`}>
            {colors.label}
          </span>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-[#1B2A4A] rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-white">
          {formatKsh(actual)}
        </span>
        <span className="text-gray-500 font-mono">
          / {formatKsh(budget)}
        </span>
      </div>
    </div>
  );
}
