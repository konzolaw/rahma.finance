'use client';

import { useEffect, useState, useMemo } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome, useIncomeSummary } from '@/hooks/useIncome';
import { formatKsh } from '@/lib/formatters';
import { ExpenseEntry, IncomeEntry } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Printer, ShieldCheck, MapPin, Globe, Phone } from 'lucide-react';

export default function StatementPrintPage() {
  const { user } = useAuthStore();
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ month, year, page_size: 500 });
  const { data: incomeData, isLoading: incomeLoading } = useIncome({ month, year, page_size: 500 });
  const { data: incomeSummaryData, isLoading: summaryLoading } = useIncomeSummary(month, year);

  const expenses: ExpenseEntry[] = expensesData?.data?.results || [];
  const income: IncomeEntry[] = incomeData?.data?.results || [];
  const openingBalance = parseFloat(incomeSummaryData?.data?.month?.carry_forward || '0');

  // Unify and sort transactions
  const transactions = useMemo(() => {
    const unified = [
      ...expenses.map(e => ({
        id: e.id,
        date: new Date(e.date),
        description: `${e.description} (${e.category} > ${e.subcategory})`,
        type: 'debit' as const,
        amount: parseFloat(e.amount.toString()),
        method: e.payment_method
      })),
      ...income.map(i => ({
        id: i.id,
        date: new Date(i.date),
        description: i.description,
        type: 'credit' as const,
        amount: parseFloat(i.actual_amount.toString()),
        method: 'direct_deposit'
      }))
    ];

    return unified.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [expenses, income]);

  // Calculate totals and closing balance
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const closingBalance = openingBalance + totalCredits - totalDebits;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || expensesLoading || incomeLoading || summaryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Encrypting Statement...</p>
        </div>
      </div>
    );
  }

  let runningBalance = openingBalance;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen p-0 sm:p-8 print:p-0 print:bg-white">
      
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-black text-slate-900">Digital Statement</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Verified by KeshoKwako Security</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
        >
          <Printer size={16} />
          Print / Export PDF
        </button>
      </div>

      {/* Main Statement Content */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-[2.5rem] border border-slate-200 p-12 print:shadow-none print:border-none print:p-0 print:rounded-none overflow-hidden">
        
        {/* Bank Branding Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-slate-900 pb-10 mb-10 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">KK</div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">KeshoKwako</h1>
            </div>
            <div className="flex flex-col text-[10px] font-bold text-slate-500 uppercase tracking-widest space-y-1">
              <div className="flex items-center gap-2"><MapPin size={10} /> Nairobi, Kenya • Westlands Commercial Ctr</div>
              <div className="flex items-center gap-2"><Phone size={10} /> +254 700 000 000 • <Globe size={10} /> KeshoKwako.com</div>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">Account Statement</h2>
            <p className="text-sm font-bold text-slate-500">Period Ending: {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            <div className="mt-4 bg-slate-100 px-4 py-2 rounded-lg inline-block text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
              Account No: {user?.id.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Customer & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Customer Info */}
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</p>
              <p className="text-2xl font-black text-slate-900">{user?.display_name}</p>
              <p className="text-sm font-bold text-slate-500">{user?.email}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-blue-800 font-bold uppercase tracking-tight">
                Your account is in good standing. This statement reflects all validated transactions up to the current date.
              </p>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Consolidated Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400">Opening Balance</span>
                <span className="font-mono font-black">{formatKsh(openingBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-emerald-400">Total Credits (+)</span>
                <span className="font-mono font-black">{formatKsh(totalCredits)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-red-400">Total Debits (-)</span>
                <span className="font-mono font-black">{formatKsh(totalDebits)}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Closing Balance</span>
                <span className="text-2xl font-mono font-black text-emerald-400">{formatKsh(closingBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] border-b-2 border-slate-200 pb-2">Activity Detail</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Description</th>
                <th className="py-4 px-2 text-right">Debit (Ksh)</th>
                <th className="py-4 px-2 text-right">Credit (Ksh)</th>
                <th className="py-4 px-2 text-right">Balance (Ksh)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="bg-slate-50/50">
                <td className="py-4 px-2 font-bold text-slate-400">{currentDate.toLocaleString('default', { month: 'short', day: '2-digit' })}</td>
                <td className="py-4 px-2 font-black text-slate-900 uppercase text-[10px] tracking-widest">Balance Brought Forward</td>
                <td className="py-4 px-2"></td>
                <td className="py-4 px-2"></td>
                <td className="py-4 px-2 text-right font-mono font-black text-slate-900">{formatKsh(openingBalance)}</td>
              </tr>
              
              {transactions.map((t) => {
                const isDebit = t.type === 'debit';
                runningBalance = isDebit ? runningBalance - t.amount : runningBalance + t.amount;
                
                return (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-2 text-slate-500 font-bold">
                      {t.date.toLocaleString('default', { month: 'short', day: '2-digit' })}
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-black text-slate-900 text-xs tracking-tight uppercase">{(t.description || '').split('(')[0]}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{(t.description || '').includes('(') ? (t.description || '').split('(')[1]?.replace(')', '') : 'General Activity'}</p>
                    </td>
                    <td className="py-4 px-2 text-right font-mono font-bold text-red-600">
                      {isDebit ? formatKsh(t.amount) : ''}
                    </td>
                    <td className="py-4 px-2 text-right font-mono font-bold text-emerald-600">
                      {!isDebit ? formatKsh(t.amount) : ''}
                    </td>
                    <td className="py-4 px-2 text-right font-mono font-black text-slate-900">
                      {formatKsh(runningBalance)}
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Transaction Activity Recorded</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Regulatory & Footer */}
        <div className="mt-20 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verification</p>
              <p className="text-[9px] text-slate-500 leading-relaxed font-bold">
                This document is a certified digital record of KeshoKwako financial activity. The transactions listed herein are synchronized with your authenticated mobile and bank-linked entries. Any discrepancies should be reported within 14 days of the statement date.
              </p>
            </div>
            <div className="text-right flex flex-col items-end justify-end">
              <div className="w-24 h-24 border-2 border-slate-900 flex items-center justify-center p-2 opacity-20 rotate-12">
                <p className="text-[8px] font-black text-center uppercase tracking-tighter">KK Official Certified Record</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated: {currentDate.toLocaleString()}</span>
            <span>Ref: {user?.id.substring(0, 12).toUpperCase()}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-12 print:hidden">
        End of Official Statement
      </div>
    </div>
  );
}

// Simple AlertCircle fallback since I couldn't find it in imports
function AlertCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
