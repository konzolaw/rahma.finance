'use client';

import { AIAnalysis } from '@/types';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, UserCheck } from 'lucide-react';

interface AICopilotCardProps {
  analysis?: AIAnalysis;
  matrix?: any;
  isLoading: boolean;
}

export default function AICopilotCard({ analysis, matrix, isLoading }: AICopilotCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-[#0B1121]/50 animate-pulse mb-12">
        <div className="flex gap-8">
            <div className="w-48 h-48 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 space-y-4">
                <div className="h-4 w-32 bg-white/10 rounded mb-6" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-2/3 bg-white/5 rounded" />
            </div>
        </div>
      </div>
    );
  }

  if (!analysis || !matrix) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group overflow-hidden mb-12"
    >
      {/* Dynamic Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
      
      <div className="relative glass-card rounded-[2.5rem] p-8 border border-white/10 bg-[#0B1121]/95 backdrop-blur-3xl overflow-hidden">
        
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-[#0B1121] flex items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                  <Sparkles size={20} className="relative z-10 text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight uppercase">Advise Insights</h3>
              <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em]">Combined Intelligence Briefing</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                System Active
              </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-10">
            {/* Left: Health Core */}
            <div className="flex flex-col items-center justify-center text-center px-4 shrink-0 border-r border-white/5 pr-12 lg:min-w-[280px]">
                <div className="relative w-44 h-44 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="88" cy="88" r="80"
                            fill="none" stroke="currentColor" strokeWidth="10"
                            className="text-white/5"
                        />
                        <motion.circle
                            initial={{ strokeDasharray: "0 502" }}
                            animate={{ strokeDasharray: `${(matrix.health_score / 100) * 502} 502` }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            cx="88" cy="88" r="80"
                            fill="none" stroke="currentColor" strokeWidth="10"
                            strokeLinecap="round"
                            className={`${
                                matrix.health_score > 80 ? 'text-emerald-500' :
                                matrix.health_score > 50 ? 'text-amber-500' : 'text-red-500'
                            }`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white leading-none tracking-tighter">
                            {matrix.health_score}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Health Score</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        {matrix.health_score > 80 ? 'High Stability' :
                         matrix.health_score > 50 ? 'Medium Risk' : 'Critical Warning'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed max-w-[180px]">
                        {matrix.health_score > 80 ? 'Optimal Liquidity & Burn' :
                         matrix.health_score > 50 ? 'Monitor Variable Spend' : 'Urgent Buffer Required'}
                    </p>
                </div>
            </div>

            {/* Right: Direct Briefing */}
            <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black text-white mb-6 leading-[1.1] tracking-tighter max-w-2xl">
                    {analysis.status_line}
                </h2>
                <p className="text-base text-slate-300 mb-8 leading-relaxed font-medium">
                    {analysis.score_verdict}
                </p>

                {/* Quick Vitals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-white/5 mb-8">
                    <div>
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Burn</span>
                        <span className="text-base font-black text-white font-mono tracking-tighter">KSh {parseInt(matrix.burn_rate).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Cash Buffer</span>
                        <span className="text-base font-black text-emerald-400 font-mono tracking-tighter">KSh {parseInt(matrix.buffer).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Runway</span>
                        <span className={`text-base font-black font-mono tracking-tighter ${matrix.runway_days < 7 ? 'text-red-400' : 'text-blue-400'}`}>
                            {matrix.runway_days} Days
                        </span>
                    </div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Utilization</span>
                        <span className="text-base font-black text-purple-400 font-mono tracking-tighter">{parseFloat(matrix.utilization_rate).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* High Stakes Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Top Risk Card */}
            <div className="p-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 relative group/risk overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/risk:opacity-10 transition-opacity">
                    <AlertTriangle size={48} className="text-red-400" />
                </div>
                <div className="flex items-center gap-2 text-red-400 mb-3">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Immediate Risk</span>
                </div>
                <p className="text-base text-slate-200 font-bold leading-relaxed">
                    {analysis.top_risk}
                </p>
            </div>

            {/* Projection Card */}
            <div className="p-6 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/20 relative group/proj overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/proj:opacity-10 transition-opacity">
                    <TrendingUp size={48} className="text-blue-400" />
                </div>
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Projection</span>
                </div>
                <p className="text-base text-slate-200 font-bold leading-relaxed">
                    {analysis.projection}
                </p>
            </div>
        </div>

        {/* Corrective Actions & One Thing */}
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <Lightbulb size={16} className="text-amber-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recommended Actions</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {analysis.actions.map((action, idx) => (
                        <div 
                            key={idx}
                            className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group/action"
                        >
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-black group-hover/action:bg-amber-500 group-hover/action:text-white transition-colors">
                                {idx + 1}
                            </div>
                            <p className="text-[12px] text-slate-200 font-bold leading-snug">
                                {action}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="xl:w-[450px]">
                <div className="relative h-full p-8 rounded-[3rem] bg-gradient-to-br from-purple-600 to-blue-600 border border-white/20 overflow-hidden group/onething shadow-2xl shadow-purple-500/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.4),transparent_70%)]" />
                    <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover/onething:rotate-45 transition-transform duration-1000">
                        <Sparkles size={160} className="text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                <UserCheck size={20} />
                            </div>
                            <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">The One Thing</span>
                        </div>
                        <p className="text-2xl font-black text-white leading-[1.1] tracking-tight">
                            {analysis.one_thing}
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
}
