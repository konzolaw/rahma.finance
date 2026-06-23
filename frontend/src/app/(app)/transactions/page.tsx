'use client';

import { useState } from 'react';
import { 
  Download, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileSpreadsheet,
  FileText,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [exportType, setExportType] = useState<'expenses' | 'income'>('expenses');

  const handleDownloadCSV = () => {
    const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api/v1';
    const endpoint = exportType === 'expenses' ? '/expenses/export_csv/' : '/income/export_csv/';
    window.location.href = `${baseUrl}${endpoint}`;
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Export Header */}
      <header className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Download size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">Data Portability</span>
              <h1 className="text-2xl font-black text-white">Exports & Reporting</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Export Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-card rounded-[2rem] p-8 border border-white/5 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
            <FileSpreadsheet size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">CSV Export</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-xs">Download your entire financial history in a spreadsheet-friendly format for deep analysis.</p>
          
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl mb-6 w-full">
            {(['expenses', 'income'] as const).map(type => (
              <button
                key={type}
                onClick={() => setExportType(type)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  exportType === type ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button 
            onClick={handleDownloadCSV}
            className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-teal-900/40 transition-all active:scale-95"
          >
            Download {exportType.toUpperCase()} CSV
          </button>
        </section>

        <section className="glass-card rounded-[2rem] p-8 border border-white/5 flex flex-col items-center text-center relative group hover:border-red-500/30 transition-all">
          <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-400 mb-6 border border-red-500/20 group-hover:scale-110 transition-transform">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Formal Statements</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-xs">View professional Daily, Weekly, and Monthly bank-grade statements with running balances.</p>
          <Link 
            href="/transactions/statements"
            className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 hover:border-red-600 transition-all active:scale-95 block"
          >
            Open Statement Center
          </Link>
        </section>
      </div>

      {/* Quick View Placeholder */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4">Reporting Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-3xl p-6 border border-white/5 hover:border-teal-500/30 transition-all">
            <ArrowDownCircle className="text-red-400 mb-3" size={24} />
            <h4 className="text-sm font-black text-white mb-1">Expense Leakage</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight leading-relaxed">Analyze where your cash is going without you noticing.</p>
          </div>
          <div className="glass-card rounded-3xl p-6 border border-white/5 hover:border-teal-500/30 transition-all">
            <ArrowUpCircle className="text-emerald-400 mb-3" size={24} />
            <h4 className="text-sm font-black text-white mb-1">Income Stability</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight leading-relaxed">Track the consistency of your multiple income streams.</p>
          </div>
          <div className="glass-card rounded-3xl p-6 border border-white/5 hover:border-teal-500/30 transition-all">
            <Calendar className="text-blue-400 mb-3" size={24} />
            <h4 className="text-sm font-black text-white mb-1">Tax Readiness</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight leading-relaxed">Keep your records clean for end-of-year tax filing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
