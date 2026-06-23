'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { ExpenseEntry } from '@/types';
import { expenseFormSchema, ExpenseFormValues } from '@/lib/validators';
import { getSubcategories, PAYMENT_METHODS } from '@/lib/constants';
import { useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses';

interface EditExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseEntry | null;
}

export default function EditExpenseSheet({ isOpen, onClose, expense }: EditExpenseSheetProps) {
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
  });

  // Populate form when expense changes
  useEffect(() => {
    if (expense) {
      reset({
        category: expense.category,
        subcategory: expense.subcategory,
        description: expense.description || '',
        amount: expense.amount,
        payment_method: expense.payment_method,
        date: expense.date,
        notes: '', // Optional notes aren't currently stored in ExpenseEntry interface in same way, but keeping field
      });
      setShowDeleteConfirm(false);
    }
  }, [expense, reset]);

  if (!expense) return null;

  const subcategories = getSubcategories(expense.category as any);
  const selectedPaymentMethod = watch('payment_method');

  const onSubmit = (data: ExpenseFormValues) => {
    updateMutation.mutate(
      { id: expense.id, data: data as any },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(expense.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a1226]/80 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1B2A4A] border-t border-white/10 rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto pb-safe-area"
          >
            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>

            <div className="px-5 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Expense</h3>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {showDeleteConfirm ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-6 animate-in fade-in">
                  <h4 className="text-red-400 font-bold mb-2">Delete this expense?</h4>
                  <p className="text-sm text-gray-300 mb-4">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-lg bg-[#1f2d5c] text-white font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex justify-center"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  {/* Amount Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-teal-500 font-bold">Ksh</span>
                      <input
                        {...register('amount')}
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50 font-mono text-lg"
                      />
                    </div>
                    {errors.amount && <span className="text-red-400 text-xs">{errors.amount.message}</span>}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Description</label>
                    <input
                      {...register('description')}
                      type="text"
                      className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50"
                    />
                    {errors.description && <span className="text-red-400 text-xs">{errors.description.message}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subcategory */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-400">Subcategory</label>
                      <select
                        {...register('subcategory')}
                        className="w-full appearance-none bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50"
                      >
                        {subcategories.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-400">Date</label>
                      <input
                        {...register('date')}
                        type="date"
                        className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-400">Payment Method</label>
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const isSelected = selectedPaymentMethod === method.code;
                        return (
                          <button
                            key={method.code}
                            type="button"
                            onClick={() => setValue('payment_method', method.code as any, { shouldValidate: true, shouldDirty: true })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                              isSelected 
                                ? 'bg-teal-600 border-teal-500 text-white' 
                                : 'bg-[#1f2d5c]/50 border-white/5 text-gray-400'
                            }`}
                          >
                            {method.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-14 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors"
                      aria-label="Delete Expense"
                    >
                      <Trash2 size={20} />
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!isDirty || isSubmitting || updateMutation.isPending}
                      className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
