'use client';

import { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Play,
  ArrowRightLeft,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecurring, useDeleteRecurring, useUpdateRecurring, useCreateRecurring } from '@/hooks/useRecurring';
import { formatKsh } from '@/lib/formatters';
import { recurringApi } from '@/lib/api/recurring';
import { RecurringTransaction } from '@/types';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/lib/constants';

export default function RecurringTransactionsPage() {
  const { data: recurringData, isLoading, refetch } = useRecurring();
  const deleteMutation = useDeleteRecurring();
  const updateMutation = useUpdateRecurring();

  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const rawData = recurringData?.data;
  const transactions: RecurringTransaction[] = Array.isArray(rawData) ? rawData : ((rawData as any)?.results || []);

  const handleTrigger = async () => {
    setIsProcessing(true);
    try {
      const res = await recurringApi.trigger();
      toast.success(res.data.message);
      refetch();
    } catch (error) {
      toast.error("Failed to process transactions");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleActive = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { is_active: !current } });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header with Stats */}
      <header className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Calendar size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Automated Finance</span>
              <h1 className="text-2xl font-black text-white">Recurring Payments</h1>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleTrigger}
              disabled={isProcessing}
              className="flex-1 md:flex-none px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play size={14} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? "Processing..." : "Process Due Now"}
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="flex-1 md:flex-none px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Add Template
            </button>
          </div>
        </div>
      </header>

      {/* Billable Estimate Card & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2rem] p-8 border border-white/5 bg-emerald-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ArrowRightLeft size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Monthly Commitment</span>
            </div>
            <span className="text-4xl font-black text-white font-mono leading-none">
              {formatKsh(transactions.filter((t: RecurringTransaction) => t.type === 'expense' && t.is_active).reduce((acc: number, t: RecurringTransaction) => acc + parseFloat(t.amount), 0))}
            </span>
            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest leading-relaxed">Total fixed bills scheduled for automatic deduction this period.</p>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border border-white/5 bg-blue-500/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Coming Up This Month</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-black text-blue-400 uppercase tracking-widest">Projection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transactions
              .filter(t => t.is_active && (!t.last_processed_date || new Date(t.last_processed_date).getMonth() !== new Date().getMonth()))
              .sort((a, b) => a.day_of_period - b.day_of_period)
              .slice(0, 4)
              .map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/upcoming">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-black text-white truncate max-w-[120px]">{t.description}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Day {t.day_of_period}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-white">{formatKsh(t.amount)}</span>
                </div>
              ))
            }
            {transactions.filter(t => t.is_active && (!t.last_processed_date || new Date(t.last_processed_date).getMonth() !== new Date().getMonth())).length === 0 && (
              <div className="col-span-2 py-6 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">All scheduled bills processed for this month</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List of Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Templates</h2>
          <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded-md">{transactions.length} Total</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((t: RecurringTransaction) => (
              <div
                key={t.id}
                className={`glass-card rounded-3xl border border-white/5 p-5 flex items-center justify-between transition-all group hover:bg-white/[0.02] ${!t.is_active ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                    {t.type === 'income' ? <ArrowRightLeft size={24} /> : <CreditCard size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{t.description}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                        {t.frequency} (Day {t.day_of_period})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-sm font-black text-white font-mono">{formatKsh(t.amount)}</span>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Per {t.frequency.replace('ly', '')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(t.id, t.is_active)}
                      className={`p-2 rounded-xl transition-all ${t.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'}`}
                    >
                      {t.is_active ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
                      className="p-2 rounded-xl bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center border-dashed border-white/10">
            <div className="w-20 h-20 bg-purple-500/5 rounded-[2rem] flex items-center justify-center text-purple-500/30 mb-6 border border-purple-500/10">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Automations Yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-8">Set up your rent, subscriptions, or salaries once and we'll handle the logging for you.</p>
          </div>
        )}
      </div>

      {/* Add Modal Placeholder (Implementation can be expanded) */}
      {isAdding && (
        <RecurringForm onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}

function RecurringForm({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateRecurring();
  const [formData, setFormData] = useState<{
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    payment_method: string;
    frequency: 'monthly' | 'weekly';
    day_of_period: number;
  }>({
    type: 'expense',
    category: 'housing',
    description: '',
    amount: '',
    payment_method: 'bank_transfer',
    frequency: 'monthly',
    day_of_period: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => onClose()
    });
  };

  const paymentMethods = [
    { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
    { id: 'bank_transfer', label: 'Bank', icon: '🏦' },
    { id: 'debit_card', label: 'Card', icon: '💳' },
    { id: 'cash', label: 'Cash', icon: '💵' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="fixed inset-0 bg-[#0B1121]/90 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl glass-card rounded-[3rem] border border-white/10 p-10 shadow-2xl my-auto"
      >
        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Automation Engine</span>
              <h2 className="text-2xl font-black text-white mt-1 tracking-tight">Configure New Pulse</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-6">
              {/* Type Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Flow Direction</label>
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  {(['expense', 'income'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                        : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity / Label</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                    <ArrowRightLeft size={18} />
                  </div>
                  <input
                    required
                    placeholder="e.g. Netflix Premium"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-white font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white font-bold focus:border-purple-500/50 outline-none appearance-none cursor-pointer"
                  >
                    {formData.type === 'expense' ?
                      EXPENSE_CATEGORIES.map(c => <option key={c.code} value={c.code} className="bg-[#0B1121]">{c.label}</option>) :
                      INCOME_SOURCES.map(c => <option key={c.code} value={c.code} className="bg-[#0B1121]">{c.label}</option>)
                    }
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fixed Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">KSh</span>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-5 py-5 text-white font-mono font-black text-lg focus:border-purple-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Payment Method */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Settlement Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: pm.id })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${formData.payment_method === pm.id
                        ? 'bg-white/10 border-purple-500/50 text-white shadow-xl'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                        }`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div className="p-6 rounded-[2rem] bg-purple-600/5 border border-purple-500/10 space-y-5">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Scheduling</span>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Repeat Cycle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['monthly', 'weekly'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormData({ ...formData, frequency: f })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.frequency === f
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'text-slate-600 hover:text-slate-400'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Trigger Day ({formData.frequency === 'monthly' ? 'of month' : 'of week'})
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={formData.frequency === 'monthly' ? 31 : 6}
                    value={formData.day_of_period}
                    onChange={e => setFormData({ ...formData, day_of_period: parseInt(e.target.value) })}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white font-mono font-black text-center focus:border-purple-500/50 outline-none"
                  />
                  <p className="text-[9px] text-slate-500 font-bold uppercase text-center tracking-widest">
                    Next run will occur on {formData.frequency === 'monthly' ? `Day ${formData.day_of_period}` : `Every ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][formData.day_of_period]}`}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-purple-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initiating...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Start Automation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
