'use client';

import { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Trash2, Smartphone, Banknote, CreditCard, Landmark, Receipt } from 'lucide-react';
import { ExpenseEntry } from '@/types';
import { formatKsh, formatDayShort, formatMonthShort } from '@/lib/formatters';

interface ExpenseRowProps {
  expense: ExpenseEntry;
  onClick: (expense: ExpenseEntry) => void;
  onDelete: (id: string) => void;
}

/**
 * Reusable row for displaying a single expense
 * Includes swipe-to-delete functionality
 */
export default function ExpenseRow({ expense, onClick, onDelete }: ExpenseRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimation();
  const deleteThreshold = -75;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < deleteThreshold) {
      // Swiped far enough to trigger delete
      controls.start({ x: -window.innerWidth });
      setIsDeleting(true);
      setTimeout(() => onDelete(expense.id), 300); // Wait for animation
    } else {
      // Didn't swipe far enough, snap back
      controls.start({ x: 0 });
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone size={14} className="text-green-400" />;
      case 'cash': return <Banknote size={14} className="text-emerald-400" />;
      case 'bank_transfer': return <Landmark size={14} className="text-blue-400" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard size={14} className="text-purple-400" />;
      default: return <Receipt size={14} className="text-gray-400" />;
    }
  };

  // Format date: "Mon, 15 Oct"
  const dayName = formatDayShort(expense.date);
  const dayNum = new Date(expense.date).getDate();
  const monthName = formatMonthShort(expense.date);

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500/20 mb-2">
      {/* Background Delete Action */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center text-red-500 font-medium text-sm">
        <div className="flex flex-col items-center gap-1">
          <Trash2 size={18} />
          <span>Delete</span>
        </div>
      </div>

      {/* Foreground Draggable Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => !isDeleting && onClick(expense)}
        className="relative z-10 flex items-center justify-between p-4 bg-[#1f2d5c] hover:bg-[#1f2d5c]/80 border border-white/5 rounded-xl transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Date Block */}
          <div className="flex flex-col items-center justify-center min-w-[3rem] text-center border-r border-white/10 pr-3">
            <span className="text-[10px] uppercase text-slate-500 font-black tracking-wider">{dayName}</span>
            <span className="text-lg font-black text-white leading-none">{dayNum}</span>
            <span className="text-[10px] text-slate-500 font-bold">{monthName}</span>
          </div>

          {/* Details Block */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-white line-clamp-1">
              {expense.description || expense.subcategory}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium bg-white/10 text-gray-300 px-2 py-0.5 rounded-md uppercase tracking-wide">
                {expense.subcategory}
              </span>
              <div className="flex items-center gap-1 bg-[#1B2A4A] px-1.5 py-0.5 rounded-md">
                {getPaymentIcon(expense.payment_method)}
                <span className="text-[10px] text-gray-400 capitalize">
                  {expense.payment_method.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end">
          <span className="text-base font-bold font-mono text-red-400">
            -{formatKsh(expense.amount)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
