'use client';

import { useState, useEffect } from 'react';
import { useCreateSavings, useUpdateSavings } from '@/hooks/useSavings';
import { INVESTMENT_TYPES } from '@/lib/constants';
import { X, Save, TrendingUp, Target, CreditCard, Notebook } from 'lucide-react';
import { SavingsEntry } from '@/types';

interface SavingsFormProps {
  onClose: () => void;
  initialData?: SavingsEntry | null;
}

export default function SavingsForm({ onClose, initialData }: SavingsFormProps) {
  const createMutation = useCreateSavings();
  const updateMutation = useUpdateSavings();
  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState({
    institution: '',
    investment_type: 'mmf',
    amount_contributed: '',
    current_value: '',
    goal_target: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        institution: initialData.institution,
        investment_type: initialData.investment_type,
        amount_contributed: initialData.amount_contributed.toString(),
        current_value: initialData.current_value.toString(),
        goal_target: initialData.goal_target?.toString() || '',
        notes: initialData.notes || '',
        date: initialData.date.split('T')[0],
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: formData as any },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(formData as any, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-[#0F172A] rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-white/10 shadow-2xl my-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              {isEditing ? 'Update Investment' : 'Add Investment'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Investment Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-500 transition-colors">
                <CreditCard size={18} />
              </div>
              <input
                required
                type="text"
                placeholder="e.g. Britam MMF, Safaricom Shares"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 ring-teal-500/20 focus:border-teal-500/50 transition-all font-bold placeholder:text-gray-600"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Investment Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 ring-teal-500/20 focus:border-teal-500/50 transition-all font-bold appearance-none cursor-pointer"
                value={formData.investment_type}
                onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })}
              >
                {INVESTMENT_TYPES.map(type => (
                  <option key={type.code} value={type.code} className="bg-[#0F172A]">{type.label}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Start Date</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 ring-teal-500/20 focus:border-teal-500/50 transition-all font-bold"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount Contributed */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Principal (Ksh)</label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 ring-teal-500/20 focus:border-teal-500/50 transition-all font-mono font-bold"
                value={formData.amount_contributed}
                onChange={(e) => setFormData({ ...formData, amount_contributed: e.target.value })}
              />
            </div>

            {/* Current Value */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Market Value (Ksh)</label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 ring-teal-500/20 focus:border-teal-500/50 transition-all font-mono font-bold"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              />
            </div>
          </div>

          {/* Goal Target */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Goal (Optional)</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <Target size={18} />
              </div>
              <input
                type="number"
                placeholder="Target Amount in Ksh"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono font-bold placeholder:text-gray-600"
                value={formData.goal_target}
                onChange={(e) => setFormData({ ...formData, goal_target: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notes</label>
            <div className="relative group">
              <div className="absolute left-4 top-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <Notebook size={18} />
              </div>
              <textarea
                placeholder="Any reminders about this investment..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium h-24 resize-none placeholder:text-gray-600"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 pb-8 sm:pb-0">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-2xl py-4 font-black shadow-xl shadow-teal-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Save size={20} />
              {isPending 
                ? 'SYNCING VAULT...' 
                : isEditing 
                  ? 'UPDATE INVESTMENT' 
                  : 'SECURE INVESTMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
