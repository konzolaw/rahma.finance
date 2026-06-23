'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  TrendingUp,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportWizardProps {
  onClose: () => void;
}

type ExportScope = 'all' | 'income' | 'expenses' | 'savings';
type ExportPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

export default function ExportWizard({ onClose }: ExportWizardProps) {
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState<ExportScope[]>(['all']);
  const [period, setPeriod] = useState<ExportPeriod>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeAISummary, setIncludeAISummary] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleScope = (s: ExportScope) => {
    if (s === 'all') {
      setScope(['all']);
    } else {
      const newScope = scope.filter(item => item !== 'all');
      if (newScope.includes(s)) {
        const filtered = newScope.filter(item => item !== s);
        setScope(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setScope([...newScope, s]);
      }
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    toast.info('Synthesizing your financial audit PDF...');
    
    try {
      // Logic to call backend PDF generator
      const queryParams = new URLSearchParams({
        scope: scope.join(','),
        period,
        start_date: customRange.start,
        end_date: customRange.end,
        include_notes: includeNotes.toString(),
        include_ai: includeAISummary.toString(),
      });

      // We'll create this endpoint in the backend
      const response = await fetch(`/api/dashboard/export-pdf/?${queryParams.toString()}`);
      
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KeshoKwako_Audit_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit statement downloaded successfully! 📄');
      onClose();
    } catch (error) {
      toast.error('Audit synthesis failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="fixed inset-0 bg-[#0B1121]/95 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl my-auto"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400"
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Step {step} of 4</span>
              <h2 className="text-2xl font-black text-white mt-1 tracking-tight">
                {step === 1 && 'Audit Scope'}
                {step === 2 && 'Timeframe'}
                {step === 3 && 'Details & Depth'}
                {step === 4 && 'Final Review'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-400 mb-6 font-medium">Select which ledger branches you want to include in this audit.</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'all', label: 'Full Financial Ledger', icon: <FileText className="text-emerald-400" />, desc: 'Combined Income, Expenses & Savings' },
                      { id: 'income', label: 'Income Statements', icon: <ArrowUpCircle className="text-emerald-400" />, desc: 'All sources, variances and committed pulse' },
                      { id: 'expenses', label: 'Expense Logs', icon: <ArrowDownCircle className="text-red-400" />, desc: 'Category breakdowns and bucket allocations' },
                      { id: 'savings', label: 'Portfolio Audit', icon: <TrendingUp className="text-blue-400" />, desc: 'Investment growth, contributions and targets' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleScope(item.id as ExportScope)}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group ${
                          scope.includes(item.id as ExportScope)
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          scope.includes(item.id as ExportScope) ? 'bg-emerald-500/20' : 'bg-white/5'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white">{item.label}</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          scope.includes(item.id as ExportScope) ? 'border-emerald-500 bg-emerald-500' : 'border-white/10'
                        }`}>
                          {scope.includes(item.id as ExportScope) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="text-sm text-slate-400 mb-6 font-medium">Choose the temporal range for your audit data.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'day', label: 'Today' },
                      { id: 'week', label: 'This Week' },
                      { id: 'month', label: 'This Month' },
                      { id: 'year', label: 'Full Year' },
                      { id: 'custom', label: 'Custom Range' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPeriod(item.id as ExportPeriod)}
                        className={`p-4 rounded-2xl border transition-all text-center ${
                          period === item.id
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <Calendar size={20} className="mx-auto mb-2" />
                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {period === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                        <input 
                          type="date"
                          value={customRange.start}
                          onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                        <input 
                          type="date"
                          value={customRange.end}
                          onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <p className="text-sm text-slate-400 mb-6 font-medium">Fine-tune the content depth of your official statement.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Include Transaction Notes</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Show detailed memos in the audit</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIncludeNotes(!includeNotes)}
                        className={`w-12 h-6 rounded-full transition-all relative ${includeNotes ? 'bg-emerald-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeNotes ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">AI Health Summary</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Include KeshoKwako's expert verdict</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIncludeAISummary(!includeAISummary)}
                        className={`w-12 h-6 rounded-full transition-all relative ${includeAISummary ? 'bg-emerald-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeAISummary ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                    <Download size={36} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Ready to Synthesize</h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-8">
                    Your official audit statement is ready for generation. This document is a legally formatted record of your financial pulse.
                  </p>
                  
                  <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 mb-8">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Scope</span>
                      <span className="text-white">{scope.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Period</span>
                      <span className="text-white capitalize">{period}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Notes / AI</span>
                      <span className="text-white">{includeNotes ? 'Yes' : 'No'} / {includeAISummary ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            <button 
              onClick={step === 4 ? handleExport : nextStep}
              disabled={isGenerating}
              className="flex-[2] py-4 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isGenerating ? (
                <>Generating PDF...</>
              ) : step === 4 ? (
                <>Download Statement <Download size={16} /></>
              ) : (
                <>Continue <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
