'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  TrendingUp, 
  X,
  Wallet
} from 'lucide-react';
import Link from 'next/link';

interface QuickAddMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAddMenu({ isOpen, onClose }: QuickAddMenuProps) {
  const menuItems = [
    { 
      label: 'Receive Income', 
      icon: <ArrowDownLeft size={20} />, 
      href: '/add?type=income', 
      color: 'bg-emerald-500/20 text-emerald-400',
      description: 'Add to your cash'
    },
    { 
      label: 'Log Expense', 
      icon: <ArrowUpRight size={20} />, 
      href: '/add?type=expense', 
      color: 'bg-rose-500/20 text-rose-400',
      description: 'Track spending'
    },
    { 
      label: 'Move to Vault', 
      icon: <ShieldCheck size={20} />, 
      href: '/add?type=vault_save', 
      color: 'bg-amber-500/20 text-amber-400',
      description: 'Hide cash in vault'
    },
    { 
      label: 'Pull from Vault', 
      icon: <Wallet size={20} />, 
      href: '/add?type=vault_withdraw', 
      color: 'bg-blue-500/20 text-blue-400',
      description: 'Restore to cash'
    },
    { 
      label: 'New Investment', 
      icon: <TrendingUp size={20} />, 
      href: '/add?type=investment', 
      color: 'bg-purple-500/20 text-purple-400',
      description: 'Log growth assets'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1121]/90 backdrop-blur-md z-[60]"
          />

          {/* Menu Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-[70] max-w-lg mx-auto"
          >
            <div className="glass-card rounded-[2.5rem] p-6 border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Plus size={120} className="text-teal-500" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">Quantum Add</h2>
                  <p className="text-xs text-slate-400 font-medium">Quick transaction hub</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {menuItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-teal-400 transition-colors">{item.label}</h4>
                      <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">{item.description}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} className="text-teal-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
