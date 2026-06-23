'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatKsh } from '@/lib/formatters';

interface SavingsPoint { month: string; contributed: string; }
interface SavingsTrendChartProps { data: SavingsPoint[]; }

interface TooltipProps { active?: boolean; payload?: any[]; label?: string; }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1B2A4A] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-slate-400 text-[9px] uppercase tracking-wider font-black mb-1">{label}</p>
        <p className="text-teal-400 font-mono font-black text-sm">{formatKsh(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function SavingsTrendChart({ data }: SavingsTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-[240px] bg-white/5 animate-pulse rounded-[1.5rem]" />;

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-[1.5rem] border border-dashed border-white/10">
        <span className="text-2xl mb-2">📈</span>
        <p className="text-[9px] font-black uppercase tracking-widest">No savings data yet</p>
      </div>
    );
  }

  // Parse and format for chart
  const chartData = data.map(d => {
    const dateObj = new Date(d.month + '-01');
    return {
      month: dateObj.toLocaleString('default', { month: 'short' }),
      contributed: parseFloat(d.contributed),
    };
  });

  // Find max for highlight
  const max = Math.max(...chartData.map(d => d.contributed));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            dy={8}
          />
          <YAxis axisLine={false} tickLine={false} hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="contributed" name="Contributed" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.contributed === max ? '#14B8A6' : '#1E3A5F'}
                opacity={entry.contributed === 0 ? 0.2 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
