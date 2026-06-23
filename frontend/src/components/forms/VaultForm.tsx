'use client';

import React, { useState } from 'react';
import { ShieldCheck, Wallet, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { vaultApi } from '@/lib/api/vault';
import { toast } from 'sonner';

interface VaultFormProps {
  initialType?: 'save' | 'withdraw';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VaultForm({ initialType = 'save', onSuccess, onCancel }: VaultFormProps) {
  const [type, setType] = useState<'save' | 'withdraw'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await vaultApi.create({
        type,
        amount: parseFloat(amount),
        description: description || (type === 'save' ? 'Moved to Vault' : 'Pulled from Vault'),
        date
      });
      toast.success(type === 'save' ? 'Money stored in Vault' : 'Money returned to Cash');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process vault movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header className="text-center space-y-2">
        <div className={`w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center ${type === 'save' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {type === 'save' ? <ShieldCheck size={32} /> : <Wallet size={32} />}
        </div>
        <h1 className="text-2xl font-black text-white">Vault Movement</h1>
        <p className="text-slate-400 text-sm font-medium">Manage your secret stash</p>
      </header>

      {/* Type Switcher */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
        <button
          type="button"
          onClick={() => setType('save')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            type === 'save' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Save to Vault
        </button>
        <button
          type="button"
          onClick={() => setType('withdraw')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            type === 'withdraw' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Pull from Vault
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Amount (KSh)</label>
            <div className="relative">
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-xl font-black focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Reason (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'save' ? 'Emergency savings' : 'Need for groceries'}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-700"
            />
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
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-medium focus:border-teal-500/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              type === 'save' 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Confirm Movement
                <ArrowRight size={20} />
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
