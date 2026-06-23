'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatKsh } from '@/lib/formatters';

interface SpendingData {
  category: string;
  amount: number | string;
}

interface SpendingChartProps {
  data: SpendingData[];
}

// Vivid, high-contrast palette for dark backgrounds
const COLORS = [
  '#14B8A6', // teal
  '#38BDF8', // sky
  '#A78BFA', // violet
  '#FB7185', // rose
  '#FBBF24', // amber
  '#34D399', // emerald
  '#F472B6', // pink
  '#60A5FA', // blue
];

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  housing: '🏠',
  rent: '🏠',
  utilities: '💡',
  health: '💊',
  entertainment: '🎬',
  education: '📚',
  clothing: '👗',
  savings: '🏦',
  loans: '💳',
  personal: '👤',
  other: '📦',
};

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return '💰';
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const timer = setTimeout(() => {
      if (isSubscribed) setMounted(true);
    }, 200);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, []);

  // Process and sort data — largest category first
  const chartData = data
    .map((item) => ({
      name: item.category,
      value: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (!mounted) {
    return (
      <div className="h-[340px] w-full bg-white/5 animate-pulse rounded-[2rem]" />
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
        <span className="text-3xl mb-3">📊</span>
        <p className="text-[10px] font-black uppercase tracking-widest">No spending data for this period</p>
      </div>
    );
  }

  // Active item — either the hovered segment/row or the total
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  // Custom center label rendered via absolute positioning
  const CenterLabel = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      {activeItem ? (
        <>
          <span className="text-xl mb-0.5">{getCategoryIcon(activeItem.name)}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center px-4 leading-tight">
            {activeItem.name}
          </span>
          <span className="text-base font-black text-white font-mono mt-1">
            {formatKsh(activeItem.value)}
          </span>
          <span className="text-[9px] font-bold text-teal-400 mt-0.5">
            {((activeItem.value / total) * 100).toFixed(1)}%
          </span>
        </>
      ) : (
        <>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Spent</span>
          <span className="text-lg font-black text-white font-mono">{formatKsh(total)}</span>
          <span className="text-[9px] font-bold text-slate-500 mt-0.5">{chartData.length} categories</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

      {/* ── Left: Donut Chart ── */}
      <div className="relative w-full md:w-[240px] shrink-0 h-[240px]">
        <CenterLabel />
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={108}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
            <Tooltip
              content={() => null} // we handle tooltip via center label
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Right: Ranked Category List ── */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {chartData.map((item, index) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const isActive = activeIndex === index;
          const color = COLORS[index % COLORS.length];

          return (
            <div
              key={item.name}
              className={`group flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 cursor-default ${
                isActive
                  ? 'bg-white/8 scale-[1.01]'
                  : 'hover:bg-white/5'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Rank number */}
              <span className="text-[9px] font-black text-slate-600 w-4 text-right shrink-0">
                {index + 1}
              </span>

              {/* Color swatch */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 10px ${color}80` : 'none',
                }}
              />

              {/* Category icon + name */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-sm leading-none">{getCategoryIcon(item.name)}</span>
                <span className={`text-[11px] font-black truncate capitalize transition-colors ${
                  isActive ? 'text-white' : 'text-slate-300'
                }`}>
                  {item.name}
                </span>
              </div>

              {/* Amount + pct */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] font-black text-white font-mono">
                  {formatKsh(item.value)}
                </span>
                <span className="text-[9px] font-bold" style={{ color }}>
                  {pct.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar — full width below, spans entire row */}
              <div className="absolute left-0 right-0 bottom-0 hidden" />
            </div>
          );
        })}

        {/* Stacked progress bar at bottom */}
        <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
          {chartData.map((item, index) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div
                key={item.name}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                }}
                title={`${item.name}: ${pct.toFixed(1)}%`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </div>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1 text-right">
          Spending distribution
        </p>
      </div>
    </div>
  );
}
