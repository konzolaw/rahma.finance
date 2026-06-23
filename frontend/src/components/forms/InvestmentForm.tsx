'use client';

import React, { useState } from 'react';
import { TrendingUp, Plus, Loader2, Calendar, Building2 } from 'lucide-react';
import { savingsApi } from '@/lib/api/savings';
import { toast } from 'sonner';

interface InvestmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const INVESTMENT_TYPES = [
  { id: 'mmf', label: 'Money Market Fund (MMF)' },
  { id: 'sacco', label: 'SACCO Deposit' },
  { id: 'stocks', label: 'Stocks / Shares' },
  { id: 'chama', label: 'Chama Contribution' },
  { id: 'chumz', label: 'Chumz / Apps' },
  { id: 'emergency_fund', label: 'Emergency Fund' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'other', label: 'Other Investment' },
];

export default function InvestmentForm({ onSuccess, onCancel }: InvestmentFormProps) {
  const [type, setType] = useState('mmf');
  const [institution, setInstitution] = useState('');
  const [amount, setAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !institution) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await savingsApi.create({
        investment_type: type,
        institution,
        amount_contributed: parseFloat(amount),
        current_value: parseFloat(currentValue || amount),
        date
      });
      toast.success('Investment logged successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to log investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header className="text-center space-y-2">
        <div className="w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center bg-purple-500/20 text-purple-400">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-2xl font-black text-white">New Investment</h1>
        <p className="text-slate-400 text-sm font-medium">Log your growth assets</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Investment Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Asset Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:border-purple-500/50 outline-none transition-all appearance-none"
            >
              {INVESTMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0B1121]">{t.label}</option>
              ))}
            </select>
          </div>

          {/* Institution Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Institution / Name</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                <Building2 size={18} />
              </div>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. CIC MMF, Stima SACCO"
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-medium focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Contributed</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="KSh"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-black focus:border-purple-500/50 outline-none transition-all"
              />
            </div>

            {/* Current Value Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Current Value</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="KSh"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-black focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Date</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-medium focus:border-purple-500/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Log Asset
                <Plus size={20} />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
