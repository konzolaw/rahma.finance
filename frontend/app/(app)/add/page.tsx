'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryPicker from '@/components/forms/CategoryPicker';
import ExpenseForm from '@/components/forms/ExpenseForm';
import IncomeForm from '@/components/forms/IncomeForm';
import VaultForm from '@/components/forms/VaultForm';
import InvestmentForm from '@/components/forms/InvestmentForm';

type ViewState = 'picker' | 'expenseForm' | 'incomeForm' | 'vaultSave' | 'vaultWithdraw' | 'investment';

function AddTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewState>('picker');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'income') setView('incomeForm');
    else if (type === 'expense') setView('picker');
    else if (type === 'vault_save') setView('vaultSave');
    else if (type === 'vault_withdraw') setView('vaultWithdraw');
    else if (type === 'investment') setView('investment');
  }, [searchParams]);

  const handleSelectCategory = (type: 'expense' | 'income', categoryCode?: string) => {
    if (type === 'income') {
      setView('incomeForm');
    } else if (categoryCode) {
      setSelectedCategory(categoryCode);
      setView('expenseForm');
    }
  };

  const handleCancel = () => {
    setView('picker');
    setSelectedCategory('');
  };

  const handleSuccess = () => {
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="relative min-h-[80vh] pb-10">
      <AnimatePresence mode="wait">
        {view === 'picker' && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <CategoryPicker onSelect={handleSelectCategory} />
          </motion.div>
        )}

        {view === 'expenseForm' && (
          <motion.div
            key="expenseForm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#0B1121]"
          >
            <ExpenseForm
              initialCategory={selectedCategory}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {view === 'incomeForm' && (
          <motion.div
            key="incomeForm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#0B1121]"
          >
            <IncomeForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {view === 'vaultSave' && (
          <motion.div
            key="vaultSave"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#0B1121]"
          >
            <VaultForm
              initialType="save"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {view === 'vaultWithdraw' && (
          <motion.div
            key="vaultWithdraw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#0B1121]"
          >
            <VaultForm
              initialType="withdraw"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        {view === 'investment' && (
          <motion.div
            key="investment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-[#0B1121]"
          >
            <InvestmentForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Quantum Interface...</div>}>
      <AddTransactionContent />
    </Suspense>
  );
}
