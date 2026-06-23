'use client';

import { useState } from 'react';
import { formatKsh, formatMonthYear } from '@/lib/formatters';
import { useStatement } from '@/hooks/useDashboard';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function FinancialStatementsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const day = currentDate.getDate();

  const { data: statementResponse, isLoading } = useStatement(month, year, day, period);
  const statement = statementResponse?.data;

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

  const getPeriodLabel = () => {
    if (period === 'day') {
      return currentDate.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (period === 'week') {
      const dayOfMonth = currentDate.getDate();
      const weekNum = Math.ceil(dayOfMonth / 7);
      return `Week ${weekNum} ${currentDate.toLocaleDateString('en-KE', { month: 'long' })}`;
    }
    return formatMonthYear(currentDate);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <header className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Official Financial Record</span>
              <h1 className="text-3xl font-black text-white tracking-tighter">{getPeriodLabel()}</h1>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex shadow-inner">
              {(['day', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronLeft size={20} /></button>
              <button onClick={handleNext} className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="py-20 text-center animate-pulse">
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Compiling Official Statement...</p>
        </div>
      ) : statement ? (
        <div className="space-y-8">
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard 
              label="Opening Balance" 
              value={statement.opening_balance} 
              icon={<ShieldCheck size={18} className="text-slate-400" />} 
              sub="Brought Forward"
            />
            <SummaryCard 
              label="Total Income" 
              value={statement.total_income} 
              icon={<ArrowUpRight size={18} className="text-emerald-400" />} 
              sub={`${period}ly Credits`}
              trend="positive"
            />
            <SummaryCard 
              label="Total Outflow" 
              value={parseFloat(statement.total_expenses) + parseFloat(statement.total_savings)} 
              icon={<ArrowDownRight size={18} className="text-red-400" />} 
              sub="Expenses + Savings"
              trend="negative"
            />
            <SummaryCard 
              label="Closing Balance" 
              value={statement.closing_balance} 
              icon={<Zap size={18} className="text-amber-400" />} 
              sub="Final Position"
              primary
            />
          </div>

          {/* Statement View */}
          <section className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl bg-white/5">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Transaction Registry</h3>
              <div className="flex gap-2">
                <Link 
                  href={`/transactions/print?period=${period}&day=${day}&month=${month}&year=${year}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 transition-all"
                >
                  <Printer size={14} /> Print Statement
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 bg-black/20">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Reference</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-right">Debit</th>
                    <th className="py-4 px-6 text-right">Credit</th>
                    <th className="py-4 px-6 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {statement.transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 text-slate-400 font-bold whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-KE', { month: 'short', day: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 font-mono text-[9px] text-slate-500">
                        {tx.reference}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-black text-white uppercase tracking-tight truncate max-w-[200px]">{tx.description}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{tx.category}</p>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-red-400">
                        {tx.type === 'expense' || tx.type === 'savings' || tx.type === 'investment' || (tx.type === 'vault' && tx.sub_type === 'save') ? formatKsh(tx.amount) : ''}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-emerald-400">
                        {tx.type === 'income' || (tx.type === 'vault' && tx.sub_type === 'withdraw') ? formatKsh(tx.amount) : ''}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-white bg-white/[0.01] group-hover:bg-white/[0.03]">
                        {formatKsh(tx.balance)}
                      </td>
                    </tr>
                  ))}
                  {statement.transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <div className="flex flex-col items-center opacity-20">
                          <Target size={48} className="mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Transactions in this period</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Failed to generate statement. Please try again.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, sub, primary, trend }: any) {
  return (
    <div className={`glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden transition-all hover:scale-[1.02] ${primary ? 'bg-blue-600/10 border-blue-500/20 shadow-xl shadow-blue-900/20' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
          trend === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 
          trend === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-500'
        }`}>
          {sub}
        </span>
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <div className="text-xl font-black text-white font-mono">{formatKsh(value)}</div>
    </div>
  );
}
