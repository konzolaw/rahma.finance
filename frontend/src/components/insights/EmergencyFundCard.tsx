import { ShieldAlert } from 'lucide-react';

interface EmergencyFundCardProps {
  monthsCovered: number;
}

export default function EmergencyFundCard({ monthsCovered }: EmergencyFundCardProps) {
  const targetMonths = 6;
  const progressPercent = Math.min((monthsCovered / targetMonths) * 100, 100);
  
  let status = { text: 'Keep Building 🚧', color: 'text-amber-400', bar: 'bg-amber-500' };
  if (monthsCovered >= targetMonths) {
    status = { text: 'Fully Funded ✅', color: 'text-emerald-400', bar: 'bg-emerald-500' };
  } else if (monthsCovered >= 3) {
    status = { text: 'Half Way 🔧', color: 'text-teal-400', bar: 'bg-teal-500' };
  } else if (monthsCovered < 1) {
    status = { text: 'Critical Risk ⚠️', color: 'text-red-400', bar: 'bg-red-500' };
  }

  return (
    <div className="bg-gradient-to-br from-[#1B2A4A] to-[#1f2d5c] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative icon */}
      <div className="absolute -right-6 -bottom-6 opacity-5">
        <ShieldAlert size={120} />
      </div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <ShieldAlert size={20} />
        </div>
        <h2 className="text-lg font-bold text-white">Emergency Fund</h2>
      </div>

      <div className="flex items-end gap-2 mb-4 relative z-10">
        <span className="text-5xl font-mono font-bold text-white tracking-tighter">
          {monthsCovered.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400 mb-1 font-medium">months covered</span>
      </div>

      <div className="flex justify-between items-end mb-2 relative z-10">
        <span className={`text-xs font-bold uppercase tracking-wider ${status.color}`}>
          {status.text}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">Target: {targetMonths} months</span>
      </div>

      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden relative z-10">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bar}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {monthsCovered < targetMonths && (
        <p className="text-xs text-gray-400 mt-4 leading-relaxed relative z-10">
          An emergency fund covering 6 months of expenses protects you against job loss or sudden medical bills. 
        </p>
      )}
    </div>
  );
}
