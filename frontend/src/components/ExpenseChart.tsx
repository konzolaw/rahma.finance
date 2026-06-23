'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface ExpenseChartProps {
  categories: Record<string, any>;
}

const COLORS = [
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#6366f1', // indigo
];

export default function ExpenseChart({ categories }: ExpenseChartProps) {
  const chartData = Object.entries(categories).map(([category, data]: [string, any]) => ({
    name: category,
    value: parseFloat(data.amount || 0),
    percentage: parseFloat(data.percentage || 0),
  }));

  const hasData = chartData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
        <div className="text-center py-12 text-gray-500">
          <p>No expenses recorded this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => `Ksh ${parseFloat(value).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
