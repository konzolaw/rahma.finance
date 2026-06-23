'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';
import { incomeApi } from '@/lib/api/income';
import { incomeFormSchema, IncomeFormValues } from '@/lib/validators';
import { INCOME_SOURCES, PAYMENT_METHODS } from '@/lib/constants';

interface IncomeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for adding or editing income
 */
export default function IncomeForm({ onSuccess, onCancel }: IncomeFormProps) {
  const [showExpected, setShowExpected] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      income_source: 'salary',
      date: new Date().toISOString().split('T')[0],
      description: '',
      actual_amount: '',
      expected_amount: '',
      payment_method: 'mpesa',
    },
  });

  const createMutation = useMutation({
    mutationFn: incomeApi.create,
    onSuccess: () => {
      toast.success('Income saved successfully ✅');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save income');
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    // If expected_amount is empty, we can default it to actual_amount or leave it empty depending on backend logic.
    // The backend `expected_amount` defaults to `actual_amount` if not provided in our design.
    createMutation.mutate(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-8 animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={onCancel} className="text-gray-400 p-2 -ml-2">
          ← Back
        </button>
        <div className="bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 uppercase tracking-wide border border-emerald-500/20">
          Income
        </div>
      </div>

      {/* Actual Amount Input */}
      <div className="flex flex-col items-center justify-center py-4">
        <label className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Amount Received</label>
        <div className="flex items-center text-5xl font-mono font-bold text-white relative">
          <span className="text-2xl text-emerald-500 mr-2 absolute -left-12 top-2">Ksh</span>
          <input
            {...register('actual_amount')}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="bg-transparent border-none outline-none text-center w-full max-w-[200px] placeholder:text-white/20 focus:ring-0 p-0 m-0 text-emerald-400"
            autoFocus
          />
        </div>
        {errors.actual_amount && <span className="text-red-400 text-xs mt-2">{errors.actual_amount.message}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Description</label>
        <input
          {...register('description')}
          type="text"
          placeholder="e.g. May Salary"
          className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        {errors.description && <span className="text-red-400 text-xs ml-1">{errors.description.message}</span>}
      </div>

      {/* Income Source */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Income Source</label>
        <div className="relative">
          <select
            {...register('income_source')}
            className="w-full appearance-none bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            {INCOME_SOURCES.map((source) => (
              <option key={source.code} value={source.code}>{source.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
        {errors.income_source && <span className="text-red-400 text-xs ml-1">{errors.income_source.message}</span>}
      </div>

      {/* Payment Method */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Payment Method</label>
        <div className="relative">
          <select
            {...register('payment_method')}
            className="w-full appearance-none bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.code} value={method.code}>{method.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
        {errors.payment_method && <span className="text-red-400 text-xs ml-1">{errors.payment_method.message}</span>}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Date</label>
        <input
          {...register('date')}
          type="date"
          className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
        />
        {errors.date && <span className="text-red-400 text-xs ml-1">{errors.date.message}</span>}
      </div>

      {/* Expected Amount Toggle */}
      {!showExpected && (
        <button
          type="button"
          onClick={() => setShowExpected(true)}
          className="flex items-center gap-2 text-sm text-emerald-400 font-medium py-1 self-start hover:text-emerald-300 transition-colors"
        >
          <MessageSquarePlus size={16} />
          Add expected amount (for variance tracking)
        </button>
      )}

      {showExpected && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-xs font-medium text-gray-400 ml-1">Expected Amount (Optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">Ksh</span>
            <input
              {...register('expected_amount')}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          {errors.expected_amount && <span className="text-red-400 text-xs ml-1">{errors.expected_amount.message}</span>}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || createMutation.isPending}
        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
      >
        {isSubmitting || createMutation.isPending ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Save Income'
        )}
      </button>

    </form>
  );
}
