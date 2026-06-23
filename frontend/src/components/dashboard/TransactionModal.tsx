'use client';

import { X } from 'lucide-react';
import { formatKsh } from '@/lib/formatters';
import { useIncome } from '@/hooks/useIncome';
import { useExpenses } from '@/hooks/useExpenses';
import { useSavings, useVault } from '@/hooks/useSavings';
import { useStatement } from '@/hooks/useDashboard';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'cash' | 'savings' | 'vault';
  dateParams: {
    month: number;
    year: number;
    day?: number;
    period: string;
  };
  title: string;
}

interface Transaction {
  id?: string | number;
  date: string;
  time?: string;
  description?: string;
  income_source_display?: string;
  category_display?: string;
  category?: string;
  payment_method_display?: string;
  actual_amount?: string | number;
  amount?: string | number;
  amount_contributed?: string | number;
  type?: 'income' | 'expense' | 'savings' | 'vault' | 'investment';
  sub_type?: 'save' | 'withdraw';
}

export default function TransactionModal({ isOpen, onClose, type, dateParams, title }: TransactionModalProps) {
  // Common date filters
  const filters: Record<string, any> = {
    month: dateParams.month,
    year: dateParams.year,
    period: dateParams.period,
  };
  if (dateParams.day) {
    filters['day'] = dateParams.day;
  }

  // Specific hooks based on type - ONLY enable the one we need
  const { data: incomeData, isLoading: isLoadingIncome } = useIncome(
    filters, 
    { enabled: isOpen && type === 'income' }
  );
  const { data: expenseData, isLoading: isLoadingExpense } = useExpenses(
    filters, 
    { enabled: isOpen && type === 'expense' }
  );
  const { data: savingsData, isLoading: isLoadingSavings } = useSavings(
    filters, 
    { enabled: isOpen && type === 'savings' }
  );
  const { data: statementData, isLoading: isLoadingStatement } = useStatement(
    dateParams.month,
    dateParams.year,
    dateParams.day,
    dateParams.period,
    { enabled: isOpen && type === 'cash' }
  );
  const { data: vaultData, isLoading: isLoadingVault } = useVault(
    filters,
    { enabled: isOpen && type === 'vault' }
  );

  const isLoading = isLoadingIncome || isLoadingExpense || isLoadingSavings || isLoadingVault || (type === 'cash' && isLoadingStatement);

  const getTransactions = (): Transaction[] => {
    if (type === 'income') {
      const data = (incomeData as any)?.data?.results || (incomeData as any)?.results || [];
      return Array.isArray(data) ? data : [];
    }
    if (type === 'expense') {
      const data = (expenseData as any)?.data?.results || (expenseData as any)?.results || [];
      return Array.isArray(data) ? data : [];
    }
    if (type === 'savings') {
      const data = (savingsData as any)?.data?.results || (savingsData as any)?.results || [];
      return Array.isArray(data) ? data : [];
    }
    if (type === 'vault') {
      const data = (vaultData as any)?.data || (vaultData as any) || [];
      return Array.isArray(data) ? data : [];
    }
    if (type === 'cash') {
      return (statementData as any)?.data?.transactions || (statementData as any)?.transactions || [];
    }
    return [];
  };

  const transactions = getTransactions();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B1121]/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#161F35] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1c2642]">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{type === 'savings' ? 'Investment' : title} Logs</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {dateParams.period === 'day' ? `Day: ${dateParams.day}/${dateParams.month}/${dateParams.year}` : `Period: ${dateParams.month}/${dateParams.year}`}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#161F35] z-10">
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Date / Time</th>
                      <th className="py-4 px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Description</th>
                      <th className="py-4 px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Category</th>
                      <th className="py-4 px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx: Transaction, idx: number) => (
                      <tr key={tx.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white">{tx.date}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{tx.time}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {tx.description || tx.income_source_display || tx.category_display || tx.category || 'Transaction'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {tx.payment_method_display || tx.category || 'Record'}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className={`text-sm font-black font-mono ${
                            (tx.type === 'income' || type === 'income' || tx.sub_type === 'withdraw') ? 'text-emerald-400' : 
                            'text-red-400'
                          }`}>
                            {(type === 'expense' || type === 'savings' || tx.type === 'expense' || tx.type === 'savings' || tx.type === 'investment' || tx.sub_type === 'save') ? '-' : '+'}{formatKsh(tx.amount || tx.actual_amount || tx.amount_contributed)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="border-t-2 border-white/10 bg-white/[0.02]">
                      <td colSpan={3} className="py-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Cumulative Total for Period
                      </td>
                      <td className="py-6 px-2 text-right">
                        <span className="text-lg font-black text-white font-mono">
                          {type === 'cash' && ((statementData as any)?.data?.closing_balance || (statementData as any)?.closing_balance) 
                            ? formatKsh((statementData as any)?.data?.closing_balance || (statementData as any)?.closing_balance)
                            : formatKsh(transactions.reduce((acc: number, tx: Transaction) => {
                                const val = parseFloat(String(tx.amount || tx.actual_amount || tx.amount_contributed || 0));
                                const isOutflow = type === 'expense' || type === 'savings' || tx.type === 'expense' || tx.type === 'savings' || tx.type === 'investment' || tx.sub_type === 'save';
                                return acc + (isOutflow && type === 'cash' ? -val : val);
                              }, 0))
                          }
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <X size={32} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">No logs found for this period</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

