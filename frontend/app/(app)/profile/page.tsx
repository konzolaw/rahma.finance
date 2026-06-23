'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, User as UserIcon, Mail, Users, Link as LinkIcon, Camera, Zap, Download, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { usePartner } from '@/hooks/usePartner';
import { User } from '@/types';
import ExportWizard from '@/components/profile/ExportWizard';

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  expected_monthly_income: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout: storeLogout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: '',
      expected_monthly_income: '',
    },
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      reset({
        display_name: user.display_name,
        expected_monthly_income: user.expected_monthly_income?.toString() || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Clean up empty string
      const payload: Partial<User> = {
        display_name: data.display_name,
        expected_monthly_income: data.expected_monthly_income || undefined
      };
      
      const response = await authApi.updateMe(payload);
      setUser(response.data.user);
      toast.success('Profile updated successfully ✅');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
      storeLogout();
      router.push('/login');
    } catch (error) {
      // Even if API fails, clear local state
      storeLogout();
      router.push('/login');
    }
  };

  const { invites, isInviting, invitePartner, acceptInvite, rejectInvite, unlinkPartner } = usePartner();
  const [partnerEmail, setPartnerEmail] = useState('');

  const handleInvite = () => {
    if (partnerEmail) {
      invitePartner(partnerEmail);
      setPartnerEmail('');
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Profile & Settings</h2>
      </div>

      {/* Received Invites */}
      {invites.length > 0 && (
        <div className="mb-8 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 ml-4">Pending Requests</h4>
          {invites.map((invite) => (
            <div key={invite.id} className="glass-card rounded-[2rem] border border-purple-500/20 p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-purple-500/5 shadow-lg shadow-purple-900/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-lg font-black">
                  {invite.inviter_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{invite.inviter_name} invited you</p>
                  <p className="text-slate-500 text-[10px] font-bold">{invite.inviter_email}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => acceptInvite(invite.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Accept
                </button>
                <button 
                  onClick={() => rejectInvite(invite.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Profile Header */}
      <div className="bg-[#1f2d5c]/20 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 mb-8 flex flex-col items-center relative overflow-hidden">
        <div className="relative mb-6">
          <div className="w-28 h-28 bg-teal-500/10 rounded-full border-4 border-white/5 flex items-center justify-center text-teal-400 text-5xl font-black shadow-inner">
            {user.display_name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-1 right-1 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white border-4 border-[#0B1121] hover:bg-teal-500 transition-all hover:scale-110 shadow-xl">
            <Camera size={16} />
          </button>
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight">{user.display_name}</h3>
        <p className="text-slate-400 font-bold text-sm flex items-center gap-1.5 mt-2">
          <Mail size={14} className="text-teal-500" /> {user.email}
        </p>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card rounded-[2rem] border border-white/5 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <UserIcon size={20} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personal Information</h4>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
            <input
              {...register('display_name')}
              type="text"
              className="w-full bg-[#0B1121]/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-teal-500/50 transition-all"
            />
            {errors.display_name && <span className="text-red-400 text-[10px] font-bold ml-1">{errors.display_name.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expected Monthly Income (Ksh)</label>
            <div className="relative">
              <span className="absolute left-5 top-4 text-slate-500 font-bold">Ksh</span>
              <input
                {...register('expected_monthly_income')}
                type="text"
                inputMode="decimal"
                className="w-full bg-[#0B1121]/50 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white font-mono font-bold focus:outline-none focus:border-teal-500/50 transition-all"
                placeholder="e.g. 150000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-teal-900/40"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Partner Account Section */}
      <div className="glass-card rounded-[2rem] border border-white/5 p-6 mb-8 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users size={20} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Partner Account</h4>
          </div>
          <span className="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md uppercase font-black tracking-[0.2em]">Shared Mode</span>
        </div>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
          Link an account to securely share and track household expenses together while maintaining individual privacy.
        </p>
        
        {user.partner_user ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LinkIcon size={18} className="text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-emerald-400">Partner Linked</span>
                <span className="text-[10px] text-emerald-400/60 font-mono">{typeof user.partner_user === 'object' ? user.partner_user?.display_name : user.partner_user}</span>
              </div>
            </div>
            <button 
              onClick={() => unlinkPartner()}
              className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Unlink
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input 
              type="email" 
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="Partner's email" 
              className="flex-1 bg-[#0B1121]/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white font-bold focus:outline-none focus:border-purple-500/50 transition-all"
            />
            <button 
              onClick={handleInvite}
              disabled={isInviting || !partnerEmail}
              className="px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40"
            >
              {isInviting ? '...' : 'Invite'}
            </button>
          </div>
        )}
      </div>

      {/* System Control */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6 ml-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Zap size={20} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Control</h4>
        </div>

        <div className="space-y-3">
          {/* Automations Card */}
          <button 
            onClick={() => router.push('/recurring')}
            className="w-full glass-card rounded-3xl border border-white/5 p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-white">Automations</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recurring Pulse Manager</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Export Data Card */}
          <button 
            onClick={() => setIsExporting(true)}
            className="w-full glass-card rounded-3xl border border-white/5 p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-white">Financial Audit</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Export Transaction Data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">JSON/CSV</span>
              <ChevronRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-12 px-4">
        {showLogoutConfirm ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 animate-in zoom-in-95 duration-200">
            <h4 className="text-red-400 font-black mb-6 text-center text-lg">Are you sure you want to log out?</h4>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/40 flex justify-center items-center"
              >
                {isLoggingOut ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
          >
            <LogOut size={18} />
            Log Out
          </button>
        )}
      </div>
      
      {isExporting && (
        <ExportWizard onClose={() => setIsExporting(false)} />
      )}
    </div>
  );
}
