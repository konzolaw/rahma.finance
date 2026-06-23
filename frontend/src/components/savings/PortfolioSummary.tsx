import { formatKsh, formatPercent } from '@/lib/formatters';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PortfolioSummaryProps {
  totalContributed: number | string;
  currentValue: number | string;
  profitLoss: number | string;
  goalTarget?: number | string;
  goalProgress?: number | string;
  byType: Record<string, { current_value: string }>;
}

const COLORS = ['#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

/**
 * Premium Portfolio Summary with glassmorphism and charts
 */
export default function PortfolioSummary({
  totalContributed,
  currentValue,
  profitLoss,
  goalTarget,
  goalProgress,
  byType,
}: PortfolioSummaryProps) {
  const isProfit = parseFloat(profitLoss.toString()) >= 0;
  const contributed = parseFloat(totalContributed.toString()) || 1; // Prevent division by zero
  const profitPercent = (parseFloat(profitLoss.toString()) / contributed) * 100;
  const progress = parseFloat(goalProgress?.toString() || '0');
  const targetValue = parseFloat(goalTarget?.toString() || '0');

  const chartData = Object.entries(byType).map(([name, data]) => ({
    name,
    value: parseFloat(data.current_value),
  })).filter(d => d.value > 0);

  return (
    <div className="relative overflow-hidden glass-card rounded-[2.5rem] border border-white/5 shadow-2xl p-8 mb-8">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />

      <div className="flex flex-col relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Wallet size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Net Worth Growth</span>
            <h2 className="text-xl font-black text-white">Portfolio Asset Value</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 items-center">
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Market Value</span>
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter">
                {formatKsh(currentValue)}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                isProfit ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {isProfit ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Total Yield</span>
                  <span className="text-sm font-black font-mono">
                    {formatKsh(profitLoss)} ({formatPercent(profitPercent)})
                  </span>
                </div>
              </div>

              {targetValue > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border bg-purple-500/10 border-purple-500/20 text-purple-400">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest">Goal Progress</span>
                    <span className="text-sm font-black font-mono">
                      {formatPercent(progress)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {targetValue > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolio Goal</span>
                  <span className="text-[10px] font-black text-white font-mono">{formatKsh(currentValue)} / {formatKsh(targetValue)}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      return (
                        <div className="bg-[#0F172A] border border-white/10 rounded-xl p-2 shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{payload[0]?.name}</p>
                          <p className="text-xs font-black text-white font-mono">{formatKsh((payload[0]?.value as number) || 0)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Allocation</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Principle Capital</span>
            <span className="text-lg font-black text-white/80 font-mono">{formatKsh(totalContributed)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Status</span>
            <span className="text-lg font-black text-teal-500 uppercase italic">On Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}
