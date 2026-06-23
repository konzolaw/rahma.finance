'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { expensesApi } from '@/lib/api/expenses';
import { expenseFormSchema, ExpenseFormValues } from '@/lib/validators';
import { getSubcategories, getCategoryLabel, PAYMENT_METHODS } from '@/lib/constants';

interface ExpenseFormProps {
  initialCategory: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for adding or editing an expense
 */
export default function ExpenseForm({ initialCategory, onSuccess, onCancel }: ExpenseFormProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const queryClient = useQueryClient();

  const subcategories = getSubcategories(initialCategory as any);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: initialCategory as any,
      subcategory: subcategories[0] || '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'mpesa',
      description: '',
      amount: '',
      notes: '',
    },
  });

  const selectedPaymentMethod = watch('payment_method');
  const selectedSubcategory = watch('subcategory');

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      toast.success('Expense saved successfully ✅');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
      reset();
      setCustomSubcategory('');
      onSuccess();
    },
    onError: (error: Error | any) => {
      toast.error(error?.response?.data?.message || 'Failed to save expense');
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    const payload = { ...data };
    if (payload.subcategory === 'custom') {
      payload.subcategory = customSubcategory.trim() || 'Other';
    }
    createMutation.mutate(payload as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-8 animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={onCancel} className="text-gray-400 p-2 -ml-2">
          ← Back
        </button>
        <div className="bg-[#1f2d5c] px-3 py-1 rounded-full text-xs font-semibold text-teal-400 uppercase tracking-wide border border-teal-500/20">
          {getCategoryLabel(initialCategory)}
        </div>
      </div>

      {/* Amount Input */}
      <div className="flex flex-col items-center justify-center py-4">
        <label className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Amount</label>
        <div className="flex items-center text-5xl font-mono font-bold text-white relative">
          <span className="text-2xl text-teal-500 mr-2 absolute -left-12 top-2">Ksh</span>
          <input
            {...register('amount')}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="bg-transparent border-none outline-none text-center w-full max-w-[200px] placeholder:text-white/20 focus:ring-0 p-0 m-0"
            autoFocus
          />
        </div>
        {errors.amount && <span className="text-red-400 text-xs mt-2">{errors.amount.message}</span>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">What was this for?</label>
        <input
          {...register('description')}
          type="text"
          placeholder="e.g. Naivas Supermarket"
          className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
        />
        {errors.description && <span className="text-red-400 text-xs ml-1">{errors.description.message}</span>}
      </div>

      {/* Subcategory */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Subcategory</label>
        <div className="relative">
          <select
            {...register('subcategory')}
            className="w-full appearance-none bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="" disabled>Select a subcategory</option>
            {subcategories.map((sub: string) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
            <option value="custom">Other / Custom...</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
        {errors.subcategory && <span className="text-red-400 text-xs ml-1">{errors.subcategory.message}</span>}
      </div>

      {/* Custom Subcategory Input */}
      <AnimatePresence>
        {selectedSubcategory === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1.5 overflow-hidden"
          >
            <label className="text-xs font-medium text-teal-400 ml-1">Custom Subcategory Name</label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Gifts, Pocket Money"
              value={customSubcategory}
              onChange={(e) => setCustomSubcategory(e.target.value)}
              className="w-full bg-[#1f2d5c]/50 border border-teal-500/30 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Pills */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-400 ml-1">Payment Method</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentMethod === method.code;
            return (
              <button
                key={method.code}
                type="button"
                onClick={() => setValue('payment_method', method.code as any, { shouldValidate: true })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  isSelected 
                    ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/30' 
                    : 'bg-[#1f2d5c]/50 border-white/5 text-gray-400 hover:bg-[#1f2d5c]'
                }`}
              >
                {method.label}
              </button>
            );
          })}
        </div>
        {errors.payment_method && <span className="text-red-400 text-xs ml-1">{errors.payment_method.message}</span>}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-400 ml-1">Date</label>
        <input
          {...register('date')}
          type="date"
          className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50 transition-colors [color-scheme:dark]"
        />
        {errors.date && <span className="text-red-400 text-xs ml-1">{errors.date.message}</span>}
      </div>

      {/* Notes Toggle */}
      {!showNotes ? (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="flex items-center gap-2 text-sm text-teal-400 font-medium py-2 self-start hover:text-teal-300 transition-colors"
        >
          <MessageSquarePlus size={16} />
          Add note (optional)
        </button>
      ) : (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-xs font-medium text-gray-400 ml-1">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Any additional details..."
            rows={3}
            className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors resize-none"
          />
          {errors.notes && <span className="text-red-400 text-xs ml-1">{errors.notes.message}</span>}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || createMutation.isPending}
        className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-900/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
      >
        {isSubmitting || createMutation.isPending ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Save Expense'
        )}
      </button>

    </form>
  );
}
