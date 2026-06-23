'use client';

import { useState, useEffect } from 'react';
import { formatKsh } from '@/lib/formatters';

interface MonthPoint  { month: string; amount: string; }
interface CategoryTrendsGridProps {
  data: Record<string, MonthPoint[]>;
}

// Vivid palette for category cards
const CARD_COLORS = [
  { bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   bar: '#14B8A6', text: 'text-teal-400'   },
  { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    bar: '#38BDF8', text: 'text-sky-400'    },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', bar: '#A78BFA', text: 'text-violet-400' },
  { bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   bar: '#FB7185', text: 'text-rose-400'   },
  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  bar: '#FBBF24', text: 'text-amber-400'  },
  { bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',bar: '#34D399', text: 'text-emerald-400'},
  { bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   bar: '#F472B6', text: 'text-pink-400'   },
  { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   bar: '#60A5FA', text: 'text-blue-400'   },
];

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️', transport: '🚗', housing: '🏠', rent: '🏠',
  utilities: '💡', health: '💊', entertainment: '🎬', education: '📚',
  clothing: '👗', savings: '🏦', loans: '💳', debt: '💳',
  personal: '👤', other: '📦', groceries: '🛒', gym: '💪',
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return '💰';
}

// Tiny inline SVG sparkline bar chart
function MiniBarChart({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points, 1);
  const width = 100 / points.length;

  return (
    <svg viewBox={`0 0 100 32`} className="w-full h-8" preserveAspectRatio="none">
      {points.map((v, i) => {
        const h = (v / max) * 28;
        const x = i * width + width * 0.15;
        const w = width * 0.7;
        return (
          <rect
            key={i}
            x={x}
            y={32 - h}
            width={w}
            height={Math.max(h, 1)}
            rx="2"
            fill={v === 0 ? 'rgba(255,255,255,0.08)' : color}
            opacity={v === max ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}

export default function CategoryTrendsGrid({ data }: CategoryTrendsGridProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-32 bg-white/5 animate-pulse rounded-[1.5rem]" />;

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="h-[120px] flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-[1.5rem] border border-dashed border-white/10">
        <p className="text-[9px] font-black uppercase tracking-widest">No category trend data</p>
      </div>
    );
  }

  // Sort by total spend descending
  const sorted = entries.sort(([, a], [, b]) => {
    const sumA = a.reduce((s, p) => s + parseFloat(p.amount), 0);
    const sumB = b.reduce((s, p) => s + parseFloat(p.amount), 0);
    return sumB - sumA;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {sorted.map(([name, points], idx) => {
        const color = CARD_COLORS[idx % CARD_COLORS.length];
        const amounts = points.map(p => parseFloat(p.amount));
        const total   = amounts.reduce((s, v) => s + v, 0);
        const latest  = amounts[amounts.length - 1] ?? 0;
        const prev    = amounts[amounts.length - 2] ?? 0;
        const delta   = prev > 0 ? ((latest - prev) / prev) * 100 : null;

        // Month labels for x axis
        const months = points.map(p => {
          const d = new Date(p.month + '-01');
          return d.toLocaleString('default', { month: 'short' });
        });

        return (
          <div
            key={name}
            className={`rounded-2xl border p-3.5 flex flex-col gap-2 transition-all hover:scale-[1.02] ${color.bg} ${color.border}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">{getIcon(name)}</span>
                <span className="text-[10px] font-black text-white capitalize truncate max-w-[80px]">{name}</span>
              </div>
              {delta !== null && (
                <span className={`text-[8px] font-black ${delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {delta > 0 ? '↑' : '↓'}{Math.abs(delta).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Mini bar sparkline */}
            <MiniBarChart points={amounts} color={color.bar} />

            {/* Month labels */}
            <div className="flex justify-between px-0.5">
              {months.map((m, i) => (
                <span key={i} className="text-[7px] text-slate-600 font-bold">{m}</span>
              ))}
            </div>

            {/* Totals */}
            <div className="flex items-end justify-between mt-0.5">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">6-mo total</p>
                <p className={`text-[11px] font-black font-mono ${color.text}`}>{formatKsh(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">latest</p>
                <p className="text-[11px] font-black font-mono text-white">{formatKsh(latest)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
