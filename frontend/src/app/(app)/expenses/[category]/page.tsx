'use client';

import React, { useState, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { Search, Plus, Filter, Wallet, Download } from 'lucide-react';
import { EXPENSE_CATEGORIES, getCategoryLabel } from '@/lib/constants';
import { useExpenses, useExpenseSummary, useDeleteExpense } from '@/hooks/useExpenses';
import ExpenseRow from '@/components/expenses/ExpenseRow';
import ExpenseSummaryBanner from '@/components/expenses/ExpenseSummaryBanner';
import ExpenseListSkeleton from '@/components/expenses/ExpenseListSkeleton';
import EditExpenseSheet from '@/components/expenses/EditExpenseSheet';
import { ExpenseEntry } from '@/types';
import Link from 'next/link';
import { formatMonthYear } from '@/lib/formatters';

export default function ExpenseCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryCode } = React.use(params);
  
  // Validate category
  const isValidCategory = EXPENSE_CATEGORIES.some(c => c.code === categoryCode);
  if (!isValidCategory) {
    notFound();
  }

  const categoryLabel = getCategoryLabel(categoryCode);
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);

  // Queries
  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses({
    category: categoryCode,
    month,
    year,
    page_size: 100, // Fetch up to 100 for client-side filtering in this MVP
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useExpenseSummary(month, year);
  const deleteMutation = useDeleteExpense();

  // Extract category specific summary from the global summary
  // The backend summary returns categories map under expenses.month.categories
  const categorySummary = summaryData?.data?.month?.categories?.[categoryCode] || { amount: 0, percent: 0 };
  
  // For budget vs actual, we'd ideally fetch from budget API, but for now we'll mock or use what we have
  // In a real implementation, we should use useBudgetVsActual hook, but to keep dependencies isolated:
  const budget = 0; // Default if not found
  const percentUsed = 0;
  const status = 'on_track';

  const expenses: ExpenseEntry[] = expensesData?.data?.results || [];

  // Derived state
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(e => 
      e.description?.toLowerCase().includes(query) || 
      e.subcategory.toLowerCase().includes(query)
    );
  }, [expenses, searchQuery]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));
  
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
  const monthName = formatMonthYear(currentDate);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isLoading = isLoadingExpenses || isLoadingSummary;

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-500">
      
      {/* Date Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white capitalize">{categoryLabel}</h2>
        <div className="flex items-center gap-1 bg-[#1f2d5c]/50 rounded-lg p-1 border border-white/5">
          <button onClick={handlePrevMonth} className="w-8 h-8 rounded text-gray-400 hover:text-white transition-colors">←</button>
          <span className="text-xs font-semibold text-white px-2 min-w-[80px] text-center">{monthName}</span>
          <button 
            onClick={handleNextMonth} 
            disabled={isCurrentMonth}
            className={`w-8 h-8 rounded transition-colors ${isCurrentMonth ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
          >
            →
          </button>
        </div>
      </div>

      {isLoading ? (
        <ExpenseListSkeleton />
      ) : (
        <>
          <ExpenseSummaryBanner 
            total={categorySummary.amount}
            budget={budget} // NOTE: Should wire to real budget data
            percentUsed={percentUsed}
            status={status as any}
            categoryLabel={categoryLabel}
          />

          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1f2d5c]/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <button 
              onClick={() => {
                const baseUrl = '/api/v1';
                window.location.href = `${baseUrl}/expenses/export_csv/?category=${categoryCode}`;
              }}
              className="w-12 h-12 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 active:scale-95 transition-all"
              title="Download Category CSV"
            >
              <Download size={18} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-[#1f2d5c]/50 border border-white/10 rounded-xl text-gray-400 active:scale-95 transition-all">
              <Filter size={18} />
            </button>
          </div>

          {/* List */}
          {filteredExpenses.length > 0 ? (
            <div className="space-y-2">
              {filteredExpenses.map((expense) => (
                <ExpenseRow 
                  key={expense.id} 
                  expense={expense} 
                  onClick={setEditingExpense}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#1f2d5c] rounded-full flex items-center justify-center text-gray-500 mb-4">
                <Wallet size={32} />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No expenses found</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-[200px]">
                {searchQuery 
                  ? "No expenses match your search." 
                  : `You haven't added any ${categoryLabel.toLowerCase()} expenses this month.`}
              </p>
              {!searchQuery && (
                <Link 
                  href="/add" 
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-teal-400 hover:bg-white/10 transition-colors"
                >
                  Add Your First
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <Link 
        href="/add"
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-900/40 border-2 border-[#1B2A4A] z-40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </Link>

      {/* Edit Sheet */}
      <EditExpenseSheet 
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
      />
    </div>
  );
}
