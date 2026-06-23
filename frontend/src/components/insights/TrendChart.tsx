'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatKsh } from '@/lib/formatters';

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

interface TrendChartProps {
  data: TrendData[];
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B2A4A] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-white capitalize">{entry.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {formatKsh(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data }: TrendChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[300px] w-full flex items-center justify-center">Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 italic text-sm">
        Not enough data to show trends
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(255,255,255,0.05)" 
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            hide
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3:3' }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-gray-400 capitalize">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#0D9488"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#F43F5E"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
