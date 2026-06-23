'use client';

import { useState } from 'react';
import { formatKsh, formatMonthYear } from '@/lib/formatters';
import { useBudgetVsActual } from '@/hooks/useDashboard';
import { useCreateOrUpdateBudget } from '@/hooks/useBudgets';
import { BudgetVsActual } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { 
  Save, 
  Edit3, 
  ArrowDownCircle, 
  Target, 
  ShieldCheck,
  Zap,
  PieChart
} from 'lucide-react';

export default function BudgetPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const day = currentDate.getDate();
  

  const { data: budgetResponse, isLoading } = useBudgetVsActual(month, year, day, period);
  const updateMutation = useCreateOrUpdateBudget();
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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

  const budgetVsActual: BudgetVsActual[] = budgetResponse?.data || [];
  const summary = budgetResponse?.summary;
  const income = budgetResponse?.income;

  const totalAvailable = income?.total_available || '0';

  const categoryMap = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    const existing = budgetVsActual.find(b => b.category === cat.code);
    if (existing) {
      acc[cat.code] = existing;
    } else {
      acc[cat.code] = {
        category: cat.code,
        category_label: cat.label,
        budget: '0',
        monthly_budget: '0',
        actual: '0',
        remaining: '0',
        utilization_percent: '0',
        status: 'on_track',
        days_left: 0,
        daily_budget: '0',
        daily_spent: '0'
      } as BudgetVsActual;
    }
    return acc;
  }, {} as Record<string, BudgetVsActual>);

  const handlePrev = () => {
    if (period === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    } else if (period === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(year, month - 2, 1));
    }
  };

  const handleNext = () => {
    if (period === 'day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    } else if (period === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const isCurrentMonth = 
    new Date().getMonth() === currentDate.getMonth() && 
    new Date().getFullYear() === currentDate.getFullYear();
  
  const isToday = 
    isCurrentMonth && new Date().getDate() === currentDate.getDate();

  const isDisableNext = period === 'day' ? isToday : isCurrentMonth;

  const startEditing = (category: string, currentMonthlyBudget: string) => {
    setEditingCategory(category);
    setEditValue(parseFloat(currentMonthlyBudget).toString());
  };

  const handleSave = (category: string) => {
    if (editValue && !isNaN(parseFloat(editValue))) {
      updateMutation.mutate({
        category: category as any,
        monthly_budget_ksh: editValue,
        priority: 'important'
      });
    }
    setEditingCategory(null);
  };

  const totalAllocated = budgetVsActual.reduce((sum, b) => sum + parseFloat(b.monthly_budget), 0);
  const unallocated = parseFloat(totalAvailable) - totalAllocated;
  const utilizationOverall = ( (parseFloat(summary?.spent || '0') / parseFloat(summary?.budget || '1')) * 100 );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dynamic Header & Period Selection */}
      <header className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/80">Premium Financial Planner</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              {getPeriodLabel()}
              {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
            </h1>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
             {/* Period Selector */}
            <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex shadow-inner">
              {(['day', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Account Mode & Nav */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-[#1f2d5c]/40 px-4 py-2 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Personal Mode
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors">←</button>
                <button onClick={handleNext} disabled={isDisableNext} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDisableNext ? 'opacity-10' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}>→</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Allocation Command Center */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income (Monthly Capacity) */}
        <div className="glass-card rounded-[2rem] p-6 border border-white/5 bg-gradient-to-br from-teal-500/10 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={48} className="text-teal-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-500/70 mb-2">Total Monthly Capacity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formatKsh(totalAvailable)}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Budgetable</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">System Synchronized</span>
          </div>
        </div>

        {/* Total Allocated (The Plan) */}
        <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart size={48} className="text-blue-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Allocated to Goals</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formatKsh(totalAllocated)}</span>
            <span className="text-[10px] font-bold text-slate-500">{( (totalAllocated / parseFloat(totalAvailable || '1')) * 100 ).toFixed(1)}%</span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${Math.min((totalAllocated / parseFloat(totalAvailable || '1')) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Unallocated (The Buffer) */}
        <div className={`glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group ${unallocated < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/5'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={48} className={unallocated < 0 ? 'text-red-400' : 'text-emerald-400'} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Unallocated Buffer</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${unallocated < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatKsh(unallocated)}</span>
            <span className="text-[10px] font-bold text-slate-500">Remainder</span>
          </div>
          <p className="mt-3 text-[9px] font-medium text-slate-400 leading-tight">
            {unallocated < 0 
              ? "Warning: Your monthly allocations exceed your total available income." 
              : "This is your monthly surplus available for unexpected expenses or reinvestment."}
          </p>
        </div>
      </section>

      {/* Allocation Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Strategic Allocation Matrix</h3>
            <span className="px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">Real-time</span>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/[0.03]">
            {EXPENSE_CATEGORIES.map(cat => {
              const catData = categoryMap[cat.code];
              if (!catData) return null;
              
              return (
                <BudgetRow 
                  key={cat.code}
                  category={cat}
                  data={catData}
                  period={period}
                  isEditing={editingCategory === cat.code}
                  onEdit={() => startEditing(cat.code, catData.monthly_budget)}
                  onSave={() => handleSave(cat.code)}
                  editValue={editValue}
                  onEditValueChange={setEditValue}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Logic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-6 border border-white/5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <PieChart size={20} />
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Utilization Index</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              You have utilized <span className="text-white font-bold">{utilizationOverall.toFixed(1)}%</span> of your <span className="text-white font-bold">{period}ly</span> adjusted budget of {formatKsh(summary?.budget || '0')}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetRow({ 
  category, 
  data, 
  period, 
  isEditing, 
  onEdit, 
  onSave, 
  editValue, 
  onEditValueChange,
}: any) {
  const isSavings = category.code === 'savings';
  const utilizationPercent = parseFloat(data.utilization_percent);

  return (
    <div className={`p-6 transition-all group ${isEditing ? 'bg-teal-500/5' : 'hover:bg-white/[0.02]'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Category Identity */}
        <div className="flex items-center gap-4 min-w-[220px]">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
            isSavings ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            {isSavings ? <Target size={20} /> : <ArrowDownCircle size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{category.label}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                data.priority === 'essential' ? 'bg-red-500/20 text-red-400' :
                data.priority === 'important' ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {data.priority || 'Standard'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Allocation Logic */}
        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Monthly Target (The Goal) */}
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              Monthly Goal <Edit3 size={8} />
            </span>
            {isEditing ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                <input 
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && onSave()}
                  className="bg-white/10 border-b-2 border-teal-500 text-white font-mono font-black text-sm focus:outline-none py-0.5 w-20"
                />
                <button onClick={onSave} className="text-teal-400 hover:text-teal-300">
                  <Save size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onEdit()}
                className="text-sm font-mono font-black text-left transition-colors text-white hover:text-teal-400"
              >
                {formatKsh(data.monthly_budget)}
              </button>
            )}
          </div>

          {/* Period Progress (The Reality) */}
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              {period}ly {isSavings ? 'Saved' : 'Spent'}
            </span>
            <span className={`text-sm font-mono font-black ${
              isSavings ? 'text-emerald-400' : 
              utilizationPercent > 100 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {formatKsh(data.actual)}
            </span>
          </div>

          {/* Utilization Bar */}
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              {period === 'month' ? 'Goal Progress' : 'Monthly Progress'}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-300">
                {period === 'month' ? utilizationPercent.toFixed(0) : parseFloat(data.monthly_utilization_percent).toFixed(0)}%
              </span>
              <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isSavings ? 'bg-emerald-500' :
                    (period === 'month' ? utilizationPercent : parseFloat(data.monthly_utilization_percent)) > 100 ? 'bg-red-500' :
                    (period === 'month' ? utilizationPercent : parseFloat(data.monthly_utilization_percent)) > 80 ? 'bg-orange-500' : 'bg-blue-500'
                  }`} 
                  style={{ width: `${Math.min(period === 'month' ? utilizationPercent : parseFloat(data.monthly_utilization_percent), 100)}%` }}
                />
              </div>
            </div>
            {period !== 'month' && (
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-1">
                Spent so far: {formatKsh(data.monthly_spent)}
              </span>
            )}
          </div>

          {/* Remaining Balance */}
          <div className="flex flex-col items-end md:items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Available Buffer</span>
            <div className="flex flex-col items-end md:items-start gap-1">
              <span className={`text-sm font-mono font-black ${parseFloat(data.remaining) < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {formatKsh(data.remaining)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
