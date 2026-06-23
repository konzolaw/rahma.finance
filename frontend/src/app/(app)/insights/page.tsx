'use client';

import { useState, useEffect } from 'react';
import { useInsights } from '@/hooks/useDashboard';
import { dashboardApi } from '@/lib/api/dashboard';
import HealthIndicator from '@/components/dashboard/HealthIndicator';
import EmergencyFundCard from '@/components/insights/EmergencyFundCard';
import TrendChart from '@/components/insights/TrendChart';
import SavingsTrendChart from '@/components/insights/SavingsTrendChart';
import CategoryTrendsGrid from '@/components/insights/CategoryTrendsGrid';
import { formatMonthYear } from '@/lib/formatters';
import {
  TrendingUp, Activity, PieChart, ShieldCheck, Zap,
  AlertTriangle, ChevronRight, Calendar, Brain,
  CheckCircle2, Clock, ArrowLeft, ArrowRight, BarChart2, Layers,
  Globe, Coins, Calculator, Send, Sparkles, AlertCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrendItem   { month: string; amount: string; }
interface Alert       { type: string; severity: 'high' | 'medium' | 'low'; message: string; category?: string; spent?: string; budget?: string; expected?: string; actual?: string; }
interface Recommendation { id: string; priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string; }

// ─── Static fallback tips (shown when recommendations array is empty) ─────────
const STATIC_TIPS = [
  { color: 'emerald', title: 'Maximize MMF Returns', body: 'Money Market Funds in Kenya compound daily. Depositing right after salary yields slightly higher returns than waiting.' },
  { color: 'blue',    title: 'SACCO Dividends',      body: 'Reinvesting your SACCO dividends leverages compound interest, rapidly accelerating your share capital growth.' },
  { color: 'amber',   title: 'Mobile Loan Trap',     body: 'Mobile loan apps charge up to 300% APR when annualized. Clear these first — no safe investment beats that rate.' },
];

// ─── Helper: severity → style ─────────────────────────────────────────────────
const severityStyle = (s: string) => {
  if (s === 'high')   return { border: 'border-rose-500/30',   bg: 'bg-rose-500/10',   text: 'text-rose-400',   badge: 'bg-rose-500/20 text-rose-400',   dot: 'bg-rose-500'   };
  if (s === 'medium') return { border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-400',  dot: 'bg-amber-500'  };
  return                     { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-400',   dot: 'bg-blue-500'   };
};

const priorityStyle = (p: string) => {
  if (p === 'high')   return { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',   icon: '🔴' };
  if (p === 'medium') return { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: '🟡' };
  return                     { badge: 'bg-teal-500/15 text-teal-400 border-teal-500/20',    icon: '🟢' };
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year  = currentDate.getFullYear();

  const [activeTab, setActiveTab] = useState<'stability' | 'advisor'>('stability');
  const [marketData, setMarketData] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<'local' | 'global'>('local');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [simAmount, setSimAmount] = useState<string>('50000');
  const [simYears, setSimYears] = useState<number>(3);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [advisorError, setAdvisorError] = useState<string>('');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await dashboardApi.getAdvisorMarketData();
        if (res.status === 'success') {
          setMarketData(res.data);
          // Set default selected asset
          if (res.data.local?.mmfs?.length > 0) {
            setSelectedAsset(res.data.local.mmfs[0]);
          }
        }
      } catch (err: any) {
        setAdvisorError('Failed to load market advisory data.');
        console.error(err);
      }
    };
    fetchMarketData();
  }, []);

  const runSimulation = async (asset: any, amountVal = simAmount, yearsVal = simYears) => {
    if (!asset) return;
    setSimLoading(true);
    try {
      const res = await dashboardApi.getAdvisorSimulation({
        amount: parseFloat(amountVal) || 0,
        currency: selectedRegion === 'local' ? 'KES' : 'USD',
        period_years: yearsVal,
        rate: asset.yield_rate,
        asset_type: asset.min_investment !== undefined ? 'mmf' : 'stock'
      });
      if (res.status === 'success') {
        setSimulationResult(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      runSimulation(selectedAsset, simAmount, simYears);
    }
  }, [selectedAsset, simAmount, simYears]);

  const handleAskAdvisor = async (queryText = chatQuery) => {
    if (!queryText.trim()) return;
    setChatLoading(true);
    setChatResponse('');
    try {
      const res = await dashboardApi.getAdvisorAdvice(queryText);
      if (res.status === 'success') {
        setChatResponse(res.data.advice);
      } else {
        setChatResponse('Unable to get investment advice at this moment.');
      }
    } catch (err) {
      setChatResponse('Error reaching AI Advisor. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-sm font-black text-white mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={index} className="text-xs font-black text-teal-400 mt-3 mb-1">{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        return (
          <li key={index} className="ml-4 list-disc text-[11px] text-slate-300 leading-relaxed my-1">
            {parseBoldText(content)}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, '');
        return (
          <li key={index} className="ml-4 list-decimal text-[11px] text-slate-300 leading-relaxed my-1">
            {parseBoldText(content)}
          </li>
        );
      }
      if (line.trim() === '') return <div key={index} className="h-2" />;
      return <p key={index} className="text-[11px] text-slate-300 leading-relaxed my-1">{parseBoldText(line)}</p>;
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-white">{part}</strong>;
      }
      return part;
    });
  };

  const { data: insightsResponse, isLoading } = useInsights(month, year);

  const insights       = insightsResponse?.data;
  const ratios         = insights?.ratios         || [];
  const alerts: Alert[]           = insights?.alerts         || [];
  const recommendations: Recommendation[] = insights?.recommendations || [];
  const emergencyMonths            = insights?.emergency_fund_months || 0;
  const generatedAt                = insights?.generated_at ? new Date(insights.generated_at) : null;

  // ── Trend data (last 6 months, newest on the right) ──
  const trendData = insights?.trends
    ? insights.trends.income_trend.map((incomeItem: TrendItem, index: number) => {
        const expenseItem = insights.trends.expense_trend[index];
        const dateObj   = new Date(incomeItem.month + '-01');
        const shortMonth = dateObj.toLocaleString('default', { month: 'short' });
        return {
          date:    shortMonth,
          income:  parseFloat(incomeItem.amount),
          expense: parseFloat(expenseItem?.amount || '0'),
        };
      }).reverse().slice(0, 6).reverse()
    : [];

  // ── Savings trend (12 months) ──
  const savingsTrend: { month: string; contributed: string }[] =
    insights?.trends?.savings_trend || [];

  // ── Category trends ──
  const categoryTrends: Record<string, { month: string; amount: string }[]> =
    insights?.trends?.category_trends || {};

  // ── Nav ──
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));
  const isCurrentMonth  =
    new Date().getMonth() === currentDate.getMonth() &&
    new Date().getFullYear() === currentDate.getFullYear();
  const monthName = formatMonthYear(currentDate);

  // ── Overall health badge (from best ratio status) ──
  const healthLevel = ratios.length === 0 ? null
    : ratios.every((r: any) => r.status === 'good')    ? 'good'
    : ratios.some((r: any) => r.status === 'critical') ? 'critical'
    : 'warning';

  const healthBadge = healthLevel === 'good'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    : healthLevel === 'critical'
    ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/20';

  const healthLabel = healthLevel === 'good' ? '✅ Healthy' : healthLevel === 'critical' ? '⚠️ Critical' : '🔶 Watch';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500 space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="glass-card rounded-[2rem] border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Row 1 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-0.5">
                Intelligence Hub
              </p>
              <p className="text-lg font-black text-white leading-tight">Deep Analytics &amp; Stability Audit</p>
            </div>
          </div>

          {/* Right: health badge + nav */}
          <div className="flex items-center gap-2">
            {healthLevel && (
              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${healthBadge}`}>
                {healthLabel}
              </span>
            )}
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="Previous month"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all ${
                isCurrentMonth
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'hover:bg-white/10 text-slate-300 hover:text-white active:scale-90'
              }`}
              title={isCurrentMonth ? 'Already at current month' : 'Next month'}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: month pill + generated_at */}
        <div className="px-6 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-slate-500" />
            <span className="text-[11px] font-black text-white">{monthName}</span>
          </div>
          {generatedAt && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock size={11} />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                Computed {generatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div className="flex bg-[#0f172a]/40 p-1 rounded-2xl border border-white/5 w-fit relative z-20">
        <button
          onClick={() => setActiveTab('stability')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'stability'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20 shadow-lg'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Activity size={12} />
          Stability Audit
        </button>
        <button
          onClick={() => {
            setActiveTab('advisor');
            if (marketData && !selectedAsset) {
              const defaultAsset = marketData[selectedRegion]?.mmfs?.[0];
              if (defaultAsset) setSelectedAsset(defaultAsset);
            }
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
            activeTab === 'advisor'
              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow-lg'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Sparkles size={12} />
          AI Investment Advisor
        </button>
      </div>

      {/* ── LOADING ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-white/5 rounded-[2rem]" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-[2rem]" />)}
          </div>
          <div className="h-64 bg-white/5 rounded-[2rem]" />
        </div>
      ) : activeTab === 'stability' ? (
        <div className="space-y-6">

          {/* ── 1. ALERTS ────────────────────────────────────────────────── */}
          {alerts.length > 0 && (
            <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Alerts</h3>
                  <p className="text-sm font-black text-white leading-tight">{alerts.length} flag{alerts.length !== 1 ? 's' : ''} for {monthName}</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {alerts.map((alert, i) => {
                  const s = severityStyle(alert.severity);
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${s.border} ${s.bg}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot} animate-pulse`} />
                      <div className="flex-1 min-w-0">
                        {alert.category && (
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${s.text}`}>{alert.category}</p>
                        )}
                        <p className="text-[12px] font-bold text-slate-200 leading-snug">{alert.message}</p>
                        {(alert.spent || alert.budget) && (
                          <div className="flex items-center gap-3 mt-1.5">
                            {alert.spent  && <span className="text-[9px] font-mono text-slate-400">Spent: <span className="text-white">{parseFloat(alert.spent).toLocaleString()}</span></span>}
                            {alert.budget && <span className="text-[9px] font-mono text-slate-400">Budget: <span className="text-white">{parseFloat(alert.budget).toLocaleString()}</span></span>}
                          </div>
                        )}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${s.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 2. EMERGENCY FUND ────────────────────────────────────────── */}
          <section>
            <EmergencyFundCard monthsCovered={emergencyMonths} />
          </section>

          {/* ── 3. STABILITY MATRIX ──────────────────────────────────────── */}
          {ratios.length > 0 && (
            <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Activity size={100} className="text-purple-500" />
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Stability Matrix</h3>
                  <p className="text-sm font-black text-white leading-tight">Diagnostic Ratios &amp; Risk Assessment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {ratios.map((ratio: any) => (
                  <HealthIndicator
                    key={ratio.id}
                    label={ratio.ratio_name}
                    value={ratio.percentage}
                    status={ratio.status}
                    benchmark={ratio.benchmark}
                    formula={ratio.formula}
                    inputs={ratio.inputs}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Expert Briefing</h4>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    These ratios define your long-term financial survival. Hitting the benchmarks means you&apos;re building a sustainable wealth engine — not just surviving payday.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── 4. MOMENTUM TRENDS ───────────────────────────────────────── */}
          <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <PieChart size={17} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Momentum Trends</h3>
                <p className="text-sm font-black text-white leading-tight">Income vs Expenses — Last 6 Months</p>
              </div>
            </div>

            <TrendChart data={trendData} />
          </section>

          {/* ── 5. SAVINGS TRAJECTORY ───────────────────────────────────── */}
          {savingsTrend.length > 0 && (
            <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <BarChart2 size={17} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Savings Trajectory</h3>
                    <p className="text-sm font-black text-white leading-tight">Monthly Contributions — Last 12 Months</p>
                  </div>
                </div>
                {/* Total contributed */}
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">12-mo total</p>
                  <p className="text-base font-black text-teal-400 font-mono">
                    {savingsTrend.reduce((s, d) => s + parseFloat(d.contributed), 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <SavingsTrendChart data={savingsTrend} />
            </section>
          )}

          {/* ── 6. CATEGORY PULSE ───────────────────────────────────────── */}
          {Object.keys(categoryTrends).length > 0 && (
            <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Layers size={17} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category Pulse</h3>
                  <p className="text-sm font-black text-white leading-tight">
                    {Object.keys(categoryTrends).length} categories tracked over 6 months
                  </p>
                </div>
              </div>

              <CategoryTrendsGrid data={categoryTrends} />
            </section>
          )}

          {/* ── 5. RECOMMENDATIONS (dynamic) / LOCAL ALPHA (fallback) ────── */}
          <section className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap size={17} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {recommendations.length > 0 ? 'Personalised Recommendations' : 'Local Alpha'}
                </h3>
                <p className="text-sm font-black text-white leading-tight">
                  {recommendations.length > 0
                    ? `${recommendations.length} action${recommendations.length !== 1 ? 's' : ''} identified for you`
                    : 'Market-Specific Optimisation'}
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {recommendations.length > 0 ? (
                // ── Dynamic recommendations from backend ──
                recommendations.map((rec) => {
                  const p = priorityStyle(rec.priority);
                  return (
                    <div key={rec.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-black text-white leading-snug">{rec.title}</h4>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.badge}`}>
                          {p.icon} {rec.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-3">{rec.description}</p>
                      <div className="flex items-center gap-2 text-teal-400">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-bold">{rec.action}</span>
                        <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })
              ) : (
                // ── Static fallback tips ──
                STATIC_TIPS.map((tip) => (
                  <div key={tip.title} className={`bg-${tip.color}-500/10 border border-${tip.color}-500/20 rounded-xl p-4`}>
                    <h4 className={`text-${tip.color}-400 font-semibold mb-1 text-sm`}>{tip.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{tip.body}</p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Market Screener */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <Globe size={17} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Market Screener</h3>
                      <p className="text-sm font-black text-white leading-tight">Explore High-Yield Opportunities</p>
                    </div>
                  </div>

                  {/* Region Toggle */}
                  <div className="flex bg-[#0f172a]/60 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => {
                        setSelectedRegion('local');
                        if (marketData?.local?.mmfs?.length > 0) {
                          setSelectedAsset(marketData.local.mmfs[0]);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                        selectedRegion === 'local'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Coins size={10} />
                      Kenyan (KES)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRegion('global');
                        if (marketData?.global?.mmfs?.length > 0) {
                          setSelectedAsset(marketData.global.mmfs[0]);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                        selectedRegion === 'global'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe size={10} />
                      Global (USD)
                    </button>
                  </div>
                </div>

                {advisorError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
                    {advisorError}
                  </div>
                )}

                {marketData ? (
                  <div className="space-y-6">
                    {/* Section 1: Money Market Funds */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                        Money Market Funds (MMFs)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedRegion === 'local' ? marketData.local.mmfs : marketData.global.mmfs).map((mmf: any) => {
                          const isSelected = selectedAsset?.code === mmf.code;
                          return (
                            <div
                              key={mmf.code}
                              onClick={() => setSelectedAsset(mmf)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                isSelected
                                  ? 'bg-teal-500/10 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                  : 'bg-white/5 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h5 className="text-xs font-black text-white group-hover:text-teal-400 transition-colors">
                                  {mmf.name}
                                </h5>
                                <span className="text-base font-black text-emerald-400 shrink-0 font-mono">
                                  {mmf.yield_rate}%
                                  <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider text-right">Yield</span>
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">
                                {mmf.highlights}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Min: {selectedRegion === 'local' ? `KES ${mmf.min_investment.toLocaleString()}` : `$${mmf.min_investment.toLocaleString()}`}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Liquidity: {mmf.withdrawal_speed}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Risk: {mmf.risk}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Dividend Stocks */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                        High-Yield Dividend Options
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedRegion === 'local' ? marketData.local.stocks : marketData.global.stocks).map((stock: any) => {
                          const isSelected = selectedAsset?.code === stock.code;
                          return (
                            <div
                              key={stock.code}
                              onClick={() => setSelectedAsset(stock)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                isSelected
                                  ? 'bg-teal-500/10 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                  : 'bg-white/5 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div>
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-bold text-teal-400 font-mono uppercase tracking-widest">
                                    {stock.code}
                                  </span>
                                  <h5 className="text-xs font-black text-white mt-1 group-hover:text-teal-400 transition-colors">
                                    {stock.name}
                                  </h5>
                                </div>
                                <span className="text-base font-black text-emerald-400 shrink-0 font-mono">
                                  {stock.yield_rate}%
                                  <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-wider text-right">Dividend</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 mt-4">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Frequency: {stock.frequency}
                                </span>
                                {stock.growth_years && (
                                  <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    Growth: {stock.growth_years} Years
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Risk: {stock.risk}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-slate-500 text-xs">
                    Loading market databases...
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Compounding Simulator */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Calculator size={17} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Compounding Simulator</h3>
                    <p className="text-sm font-black text-white leading-tight">Projections &amp; Yield Calculations</p>
                  </div>
                </div>

                {selectedAsset ? (
                  <div className="space-y-6 relative z-10">
                    {/* Selected Asset Summary */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Selected Asset</p>
                      <h4 className="text-xs font-black text-white">{selectedAsset.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Yield Rate</p>
                          <p className="text-sm font-black text-emerald-400 font-mono">{selectedAsset.yield_rate}%</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Currency</p>
                          <p className="text-sm font-black text-white font-mono">{selectedRegion === 'local' ? 'KES' : 'USD'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Investment Principal ({selectedRegion === 'local' ? 'KSh' : '$'})
                        </label>
                        <input
                          type="number"
                          value={simAmount}
                          onChange={(e) => setSimAmount(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                        {/* Quick preset buttons */}
                        <div className="flex gap-2 mt-2">
                          {selectedRegion === 'local' ? (
                            ['10000', '50000', '100000', '500000'].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => setSimAmount(amt)}
                                className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                  simAmount === amt
                                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                    : 'bg-white/5 text-slate-400 border-transparent hover:border-white/5'
                                }`}
                              >
                                {parseInt(amt) >= 100000 ? `${parseInt(amt)/1000}k` : `${parseInt(amt)/1000}k`}
                              </button>
                            ))
                          ) : (
                            ['500', '1000', '5000', '10000'].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => setSimAmount(amt)}
                                className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                  simAmount === amt
                                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                    : 'bg-white/5 text-slate-400 border-transparent hover:border-white/5'
                                }`}
                              >
                                ${parseInt(amt)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Years Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Duration
                          </label>
                          <span className="text-xs font-black text-teal-400 font-mono">
                            {simYears} Year{simYears !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={simYears}
                          onChange={(e) => setSimYears(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-[#0f172a]/60 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                    </div>

                    {/* Results */}
                    {simLoading ? (
                      <div className="flex items-center justify-center py-12 text-slate-500 text-xs">
                        Calculating compounding yields...
                      </div>
                    ) : simulationResult ? (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Gross Interest</p>
                            <p className="text-sm font-black text-white font-mono">
                              {selectedRegion === 'local' ? 'KSh' : '$'} {simulationResult.gross_interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                              Tax ({simulationResult.tax_rate_percent}% WHT)
                            </p>
                            <p className="text-sm font-black text-rose-400 font-mono">
                              - {selectedRegion === 'local' ? 'KSh' : '$'} {simulationResult.tax_deducted.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                          <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-0.5">Net Payout</p>
                          <p className="text-lg font-black text-emerald-400 font-mono">
                            {selectedRegion === 'local' ? 'KSh' : '$'} {simulationResult.net_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium mt-1">
                            Average of {selectedRegion === 'local' ? 'KSh' : '$'} {simulationResult.monthly_avg_net.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month net.
                          </p>
                        </div>

                        {/* Forex Hedging Alert */}
                        {simulationResult.forex_message && (
                          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-2.5">
                            <AlertCircle size={15} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Currency Protection</p>
                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                {simulationResult.forex_message}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs text-center space-y-2 h-64">
                    <Coins size={30} className="text-slate-600" />
                    <p>Select a fund or equity from the screener to run calculations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Advisor Chat Terminal */}
          <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Brain size={17} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Advisor Terminal</h3>
                <p className="text-sm font-black text-white leading-tight">Prompt Advisory Chat Engine</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-wrap gap-2">
                {[
                  "Which Kenyan MMF yields the most?",
                  "Compare Safaricom vs CIC MMF returns",
                  "Explain US MMF taxes for Kenyans",
                  "What is the best allocation for KSh 50,000?",
                  "SACCO dividends vs MMFs in Kenya"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setChatQuery(preset);
                      handleAskAdvisor(preset);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/5 hover:text-teal-400 text-[10px] text-slate-400 font-bold transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {(chatLoading || chatResponse) && (
                <div className="p-5 rounded-2xl bg-[#0f172a]/60 border border-white/5 min-h-[100px] flex flex-col justify-center">
                  {chatLoading ? (
                    <div className="flex items-center justify-center gap-3 text-slate-500 text-xs">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      Consulting Rama intelligence models...
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-slate-200">
                      {renderMarkdown(chatResponse)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAdvisor();
                  }}
                  placeholder="Ask advisor (e.g. 'Tell me about ICEA Lion', 'Which funds allow instant withdrawal?')"
                  className="flex-1 bg-[#0f172a]/60 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
                <button
                  onClick={() => handleAskAdvisor()}
                  disabled={chatLoading}
                  className="px-5 py-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
