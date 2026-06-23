import { formatKsh } from '@/lib/formatters';

interface ExpenseSummaryBannerProps {
  total: string | number;
  budget: string | number;
  percentUsed: string | number;
  status: 'on_track' | 'warning' | 'exceeded' | 'near_limit' | 'over_budget';
  categoryLabel: string;
}

/**
 * Banner showing monthly total and budget progress for a specific category
 */
export default function ExpenseSummaryBanner({
  total,
  budget,
  percentUsed,
  status,
  categoryLabel,
}: ExpenseSummaryBannerProps) {
  // Normalize status
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
  
  const numericTotal = typeof total === 'string' ? parseFloat(total) : total;
  const numericBudget = typeof budget === 'string' ? parseFloat(budget) : budget;
  const remaining = numericBudget - numericTotal;

  return (
    <div className="bg-[#1f2d5c]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5 shadow-lg mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {categoryLabel} Spending
          </span>
          <span className="text-3xl font-bold font-mono text-white tracking-tight">
            {formatKsh(total)}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-[#1B2A4A] px-2.5 py-1 rounded-lg border border-white/10 mb-1">
            <span className="text-xs">{colors.emoji}</span>
            <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
              {colors.label}
            </span>
          </div>
          {numericBudget > 0 && (
            <span className="text-xs text-gray-400 font-medium">
              {remaining >= 0 ? `${formatKsh(remaining)} left` : `${formatKsh(Math.abs(remaining))} over`}
            </span>
          )}
        </div>
      </div>
      
      {numericBudget > 0 ? (
        <>
          {/* Progress Bar Container */}
          <div className="h-3 w-full bg-[#1B2A4A] rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
              style={{ width: `${widthPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            <span>0%</span>
            <span>Budget: {formatKsh(budget)}</span>
            <span>100%</span>
          </div>
        </>
      ) : (
        <div className="text-xs text-amber-400/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-center">
          No budget set for this category.
        </div>
      )}
    </div>
  );
}
