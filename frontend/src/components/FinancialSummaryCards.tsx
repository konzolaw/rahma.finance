'use client';

interface SummaryCardsProps {
  income?: any;
  expenses?: any;
  savings?: any;
  budgets?: any;
}

export default function FinancialSummaryCards({ income, expenses, savings, budgets }: SummaryCardsProps) {
  const formatKsh = (value: string | number | undefined) => {
    if (!value) return 'Ksh 0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `Ksh ${num.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  };

  const cards = [
    {
      title: 'Monthly Income',
      value: formatKsh(income?.actual),
      subtext: `Expected: ${formatKsh(income?.expected)}`,
      icon: '💰',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
    },
    {
      title: 'Monthly Expenses',
      value: formatKsh(expenses?.total),
      subtext: `${expenses?.entries_count || 0} transactions`,
      icon: '💸',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
    },
    {
      title: 'Total Savings',
      value: formatKsh(savings?.total?.current_value),
      subtext: `Contributed: ${formatKsh(savings?.total?.amount_contributed)}`,
      icon: '🏦',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      title: 'Budget Status',
      value: budgets?.total?.utilization_percent ? `${budgets.total.utilization_percent.toFixed(0)}%` : '0%',
      subtext: `${formatKsh(budgets?.total?.spent)} / ${formatKsh(budgets?.total?.budget)}`,
      icon: '📊',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`${card.color} border rounded-lg p-6 transition-all hover:shadow-lg`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.subtext}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
