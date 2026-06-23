'use client';

import { useState, useEffect } from 'react';
import { 
  useMonthlyDashboard
} from '@/hooks/useDashboard';
import SummaryCard from '@/components/dashboard/SummaryCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DailySpendingChart from '@/components/dashboard/DailySpendingChart';
import AICopilotCard from '@/components/dashboard/AICopilotCard';
import TransactionModal from '@/components/dashboard/TransactionModal';
import { formatMonthYear, formatKsh } from '@/lib/formatters';
import { Calendar, TrendingUp, Target, PieChart as PieChartIcon, AlertCircle, RefreshCw, Users, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Initialize date on client to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense' | 'cash' | 'savings' | 'vault'>('income');
  const [modalTitle, setModalTitle] = useState('');
  
  const month = currentDate ? currentDate.getMonth() + 1 : new Date().getMonth() + 1;
  const year = currentDate ? currentDate.getFullYear() : new Date().getFullYear();
  const day = currentDate ? currentDate.getDate() : new Date().getDate();

  const { 
    data: dashboardResponse, 
    isLoading: isLoadingDash, 
    error: dashError 
  } = useMonthlyDashboard(month, year, day, period);

  
  
  const isLoading = isLoadingDash;
  const error = dashError;

  const handlePrev = () => {
    if (!currentDate) return;
    if (period === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    } else if (period === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(year, month - 2, 1));
    }
  };

  const handleNext = () => {
    if (!currentDate) return;
    if (period === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    } else if (period === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 text-4xl mb-6 border border-red-500/20">
          ⚠️
        </div>
        <h2 className="text-2xl font-black text-white mb-3">System Unavailable</h2>
        <p className="text-slate-400 max-w-xs mb-8 leading-relaxed font-medium">We're having trouble connecting to your financial data. Please try again in a moment.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl transition-all font-bold shadow-xl shadow-teal-900/40 active:scale-95"
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (isLoading || !dashboardResponse || !dashboardResponse.data || !currentDate) {
    return <DashboardSkeleton />;
  }

  const isCurrentMonth = 
    new Date().getMonth() === currentDate.getMonth() && 
    new Date().getFullYear() === currentDate.getFullYear();
  
  const isToday = 
    isCurrentMonth && new Date().getDate() === currentDate.getDate();

  const isDisableNext = (() => {
    if (!currentDate) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (period === 'day') return isToday;
    if (period === 'month') return isCurrentMonth;
    if (period === 'week') {
      // The week period_start is already set to Monday of the viewed week.
      // We disable Next only when Monday of NEXT week is in the future.
      const nextMonday = new Date(currentDate);
      const day = currentDate.getDay(); // 0=Sun,1=Mon..6=Sat
      const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
      nextMonday.setDate(currentDate.getDate() + daysUntilNextMonday);
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday > now;
    }
    return false;
  })();

  const monthName = formatMonthYear(currentDate);

  const getPeriodLabel = () => {
    if (period === 'day') {
      return currentDate.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (period === 'week') {
      const dayOfMonth = currentDate.getDate();
      const weekNum = Math.ceil(dayOfMonth / 7);
      return `Week ${weekNum} ${currentDate.toLocaleDateString('en-KE', { month: 'long' })}`;
    }
    return monthName;
  };

  const dashboardData = dashboardResponse.data;
  const { income, expenses, savings, matrix } = dashboardData;

  // Prepare chart data from categories
  const chartData = expenses?.month?.categories 
    ? Object.entries(expenses.month.categories).map(([key, val]: [string, any]) => ({
        category: key.replace('_', ' '),
        amount: val.amount,
      }))
    : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Command Center Header ── */}
      <header className="glass-card rounded-[2rem] border border-white/5 overflow-hidden relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none" />

        {/* ── Row 1: Title + Nav ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 relative z-10">
          {/* Left: icon + period label */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-500 mb-0.5">
                Viewing • {period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : 'Monthly'}
              </p>
              <p className="text-lg font-black text-white leading-tight">{getPeriodLabel()}</p>
            </div>
          </div>

          {/* Right: prev / today / next */}
          <div className="flex items-center gap-2">

            {/* ← Prev — always visible */}
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="Previous period"
            >
              <span className="text-base leading-none">←</span>
            </button>

            {/* Today pill — only visible when not on current period */}
            {!isToday && (
              <button
                onClick={handleToday}
                className="px-4 h-10 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-[9px] font-black uppercase tracking-widest border border-teal-500/20 transition-all"
              >
                Today
              </button>
            )}

            {/* → Next — same style as Prev, just dimmed when at limit */}
            <button
              onClick={handleNext}
              disabled={isDisableNext}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all ${
                isDisableNext
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'hover:bg-white/10 text-slate-300 hover:text-white active:scale-90'
              }`}
              title={isDisableNext ? 'Already at latest period' : 'Next period'}
            >
              <span className="text-base leading-none">→</span>
            </button>
          </div>
        </div>

        {/* ── Row 2: Period Toggle ── */}
        <div className="px-6 py-4 relative z-10">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3">View by period</p>
          <div className="grid grid-cols-3 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {([ 
              { key: 'day',   icon: '📅', label: 'Day',   desc: 'Single day view' },
              { key: 'week',  icon: '📆', label: 'Week',  desc: 'This vs Last week' },
              { key: 'month', icon: '🗓️', label: 'Month', desc: 'Full month overview' },
            ] as const).map(({ key, icon, label, desc }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl font-black transition-all duration-300 active:scale-[0.97] select-none ${
                  period === key
                    ? 'bg-teal-600 text-white shadow-[0_0_24px_rgba(20,184,166,0.4)] border border-teal-500/50'
                    : 'bg-transparent text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active indicator dot */}
                {period === key && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
                )}
                <span className="text-lg leading-none">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                <span className={`text-[8px] font-bold tracking-wide hidden sm:block ${period === key ? 'text-teal-200' : 'text-slate-600'}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <SummaryCard 
          title="Cash on Hand" 
          value={matrix?.buffer || '0'} 
          icon="💰" 
          colorScheme="portfolio" 
          periodLabel="Your Spendable Buffer"
          onClick={() => {
            setModalType('cash');
            setModalTitle('Cash Flow');
            setIsModalOpen(true);
          }}
        />
        <SummaryCard 
          title="Vault" 
          value={matrix?.vault_balance || '0'} 
          icon="🛡️" 
          colorScheme="income" 
          periodLabel="Liquid Stash"
          onClick={() => {
            setModalType('vault');
            setModalTitle('Vault Movements');
            setIsModalOpen(true);
          }}
        />
        <SummaryCard 
          title="Income" 
          value={income?.month?.period_actual || 0} 
          icon="💸" 
          colorScheme="income" 
          periodLabel={`Total this ${period}`}
          onClick={() => {
            setModalType('income');
            setModalTitle('Income');
            setIsModalOpen(true);
          }}
        />
        <SummaryCard 
          title="Expenses" 
          value={expenses?.month?.total || 0} 
          icon="📉" 
          colorScheme="expense" 
          periodLabel={`Spent this ${period}`}
          onClick={() => {
            setModalType('expense');
            setModalTitle('Expenses');
            setIsModalOpen(true);
          }}
        />
      </section>

      {/* Investment Section */}
      <section>
        <SummaryCard 
          title="Investments" 
          value={savings?.total?.current_value || 0} 
          icon="📈" 
          colorScheme="savings" 
          periodLabel="Portfolio: MMFs, SACCOs, Stocks"
          onClick={() => {
            setModalType('savings');
            setModalTitle('Investment Portfolio');
            setIsModalOpen(true);
          }}
        />
      </section>


      
      {/* Advise Insights - Unified Intelligence Briefing */}
      <AICopilotCard 
        analysis={dashboardResponse.data.ai_analysis} 
        matrix={dashboardResponse.data.matrix}
        isLoading={isLoading} 
      />



      {/* Command Center Activity Feed */}
      {(dashboardResponse.data.notifications?.length ?? 0) > 0 && (
        <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={64} className="text-blue-400" />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <RefreshCw size={18} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Activity Feed</h2>
            </div>
            <span className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Live</span>
          </div>

          <div className="space-y-3">
            {(dashboardResponse.data.notifications?.length ?? 0) > 0 ? (
              dashboardResponse.data.notifications?.map((notif, idx) => (
                <div 
                  key={idx} 
                  className={`group/item flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                    notif.severity === 'high' 
                      ? 'bg-red-500/10 border-red-500/20' 
                      : 'bg-[#0B1121]/50 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                    notif.type === 'partner_activity' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {notif.icon === 'user' ? <Users size={18} /> : 
                    notif.icon === 'alert' ? <AlertCircle size={18} /> : 
                    <Target size={18} />}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-black tracking-tight truncate ${notif.severity === 'high' ? 'text-red-400' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      {notif.amount && (
                        <span className="text-xs font-mono font-black text-white ml-2">{formatKsh(notif.amount)}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Listening for activity...</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Daily Spending Activity */}
      {dashboardResponse.data.daily_spending && dashboardResponse.data.daily_spending.length > 0 && (
        <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <TrendingUp size={18} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Daily Activity Pulse</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Peak Spend</span>
                <span className="text-sm font-black text-white font-mono">
                  {formatKsh(Math.max(...dashboardResponse.data.daily_spending.map(d => parseFloat(d.amount.toString())), 0))}
                </span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Daily</span>
                <span className="text-sm font-black text-teal-400 font-mono">
                  {formatKsh(
                    dashboardResponse.data.daily_spending.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) / 
                    (dashboardResponse.data.daily_spending.length || 1)
                  )}
                </span>
              </div>
              {dashboardResponse.data.comparison_spending && dashboardResponse.data.comparison_spending.length > 0 && (
                <>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Vs Previous</span>
                    <span className={`text-sm font-black font-mono ${
                      (() => {
                        const current = dashboardResponse.data.daily_spending.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);
                        const prev = dashboardResponse.data.comparison_spending.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);
                        const diff = current - prev;
                        return diff > 0 ? 'text-rose-400' : 'text-emerald-400';
                      })()
                    }`}>
                      {(() => {
                        const current = dashboardResponse.data.daily_spending.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);
                        const prev = dashboardResponse.data.comparison_spending.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);
                        if (prev === 0) return 'NEW';
                        const percent = ((current - prev) / prev) * 100;
                        return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
                      })()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <DailySpendingChart 
            data={dashboardResponse.data.daily_spending} 
            comparisonData={dashboardResponse.data.comparison_spending}
            period={period}
          />
        </section>
      )}

      {/* Spending Breakdown Section */}
      {chartData.length > 0 && (() => {
        const totalSpent = chartData.reduce((s, d) => s + parseFloat(d.amount.toString()), 0);
        const totalBudget = parseFloat(dashboardResponse.data.budgets?.total?.budget || '0');
        const utilPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : null;
        return (

          <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <PieChartIcon size={17} />
                </div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Spending Analysis</h2>
                  <p className="text-base font-black text-white font-mono leading-tight">{formatKsh(totalSpent)}</p>
                </div>
              </div>
              {utilPct !== null && (
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  utilPct > 100
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : utilPct > 80
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {utilPct}% of budget
                </span>
              )}
            </div>

            <SpendingChart data={chartData} />
          </section>
        );
      })()}

      {/* Transaction Detail Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        title={modalTitle}
        dateParams={{
          month,
          year,
          day,
          period
        }}
      />
    </div>
  );
}

