'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  Legend
} from 'recharts';
import { formatKsh } from '@/lib/formatters';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyData {
  day: number;
  amount: string | number;
  date: string;
}

interface DailySpendingChartProps {
  data: DailyData[];
  comparisonData?: DailyData[];
  period: 'day' | 'week' | 'month';
}

export default function DailySpendingChart({ data, comparisonData, period }: DailySpendingChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const timer = setTimeout(() => {
      if (isSubscribed) setIsMounted(true);
    }, 200);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isMounted) {
    return <div className="h-[350px] w-full bg-white/5 animate-pulse rounded-[2rem]" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <span className="text-xl">📊</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest">No activity data</p>
      </div>
    );
  }

  // Transformation logic (remains same as before but ensured dates are in chartData)
  let chartData: any[] = [];
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (period === 'month') {
    chartData = DAYS_OF_WEEK.map((dayName, idx) => {
      const dayIndex = (idx + 1) % 7;
      const entry: any = { name: dayName };
      const matches = data.filter(d => new Date(d.date).getDay() === dayIndex);
      matches.forEach((m, mIdx) => {
        const weekNum = Math.ceil(new Date(m.date).getDate() / 7);
        entry[`Week ${weekNum}`] = parseFloat(m.amount.toString());
        entry[`date${weekNum}`] = m.date;
      });
      return entry;
    });
  } else if (period === 'week') {
    chartData = DAYS_OF_WEEK.map((dayName, idx) => {
      const dayIndex = (idx + 1) % 7;
      const currentDay = data.find(d => new Date(d.date).getDay() === dayIndex);
      const previousDay = comparisonData?.find(d => new Date(d.date).getDay() === dayIndex);
      return {
        name: dayName,
        'This Week': currentDay ? parseFloat(currentDay.amount.toString()) : 0,
        'Last Week': previousDay ? parseFloat(previousDay.amount.toString()) : 0,
        dateCurrent: currentDay?.date,
        datePrev: previousDay?.date
      };
    });
  } else {
    chartData = data.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }),
      amount: parseFloat(item.amount.toString()),
      date: item.date
    }));
  }

  const COLORS = ['#14B8A6', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b'];
  const PREV_COLOR = '#475569';

  return (
    <motion.div 
      key={`${period}-${data[0]?.date}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[400px] w-full relative group" 
      style={{ minWidth: 0 }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
          barGap={period === 'month' ? 2 : 12}
        >
          <defs>
            {COLORS.map((c, i) => (
              <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={1} />
                <stop offset="100%" stopColor={c} stopOpacity={0.4} />
              </linearGradient>
            ))}
            <linearGradient id="barGradPrev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PREV_COLOR} stopOpacity={0.8} />
              <stop offset="100%" stopColor={PREV_COLOR} stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="10 10" 
            vertical={false} 
            stroke="rgba(255,255,255,0.03)" 
          />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          
          <YAxis hide />
          
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)', radius: [12, 12, 0, 0] }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#0B1121]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-300 min-w-[240px]">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    </div>
                    
                    <div className="space-y-4">
                      {payload.map((p: any, i: number) => {
                        const weekNum = p.name.replace('Week ', '');
                        const specificDate = p.payload[`date${weekNum}`] || p.payload.dateCurrent || p.payload.datePrev || p.payload.date;
                        const dateFormatted = specificDate ? new Date(specificDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

                        return (
                          <div key={i} className="group/item">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color || p.fill }} />
                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">{p.name}</span>
                              </div>
                              <span className="text-sm font-black text-white font-mono">{formatKsh(p.value)}</span>
                            </div>
                            {dateFormatted && (
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4.5">{dateFormatted}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '30px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />

          {period === 'month' ? (
            [1, 2, 3, 4, 5].map(w => (
              <Bar 
                key={w}
                name={`Week ${w}`}
                dataKey={`Week ${w}`} 
                fill={`url(#barGrad-${w-1})`}
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            ))
          ) : period === 'week' ? (
            <>
              <Bar 
                name="Last Week" 
                dataKey="Last Week" 
                fill="url(#barGradPrev)" 
                radius={[8, 8, 0, 0]} 
                animationDuration={1000}
              />
              <Bar 
                name="This Week" 
                dataKey="This Week" 
                fill="url(#barGrad-0)" 
                radius={[8, 8, 0, 0]} 
                animationDuration={1500}
              />
            </>
          ) : (
            <Bar 
              name="Spent"
              dataKey="amount" 
              fill="url(#barGrad-0)" 
              radius={[10, 10, 0, 0]} 
              animationDuration={1200}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
