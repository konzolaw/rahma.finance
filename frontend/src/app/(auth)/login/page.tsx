'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setApiError(null);
      const response = await authApi.login({ email: data.email, password: data.password });
      
      setAccessToken(response.data.access_token);
      setUser(response.data.user);
      
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 mb-6">
          <Lock className="text-teal-400" size={28} />
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">
          Welcome <span className="text-gradient">Back</span>
        </h1>
        <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">Sign in to manage your wealth</p>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 md:p-10 relative border border-white/5 overflow-hidden">
        
        {apiError && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-start gap-3 animate-in slide-in-from-top-4">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 relative z-10">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Terminal</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-teal-400 transition-colors" size={18} />
              <input
                {...register('email')}
                type="email"
                placeholder="identity@keshokwako.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-teal-500/50 focus:bg-teal-500/[0.02] transition-all"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Key</label>
              <Link href="/forgot-password" hidden className="text-[10px] text-teal-500 hover:text-teal-400 font-black uppercase tracking-widest transition-colors">
                Recover Access?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-teal-400 transition-colors" size={18} />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-teal-500/50 focus:bg-teal-500/[0.02] transition-all"
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full mt-4 bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-900/30 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>ESTABLISH CONNECTION</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center relative z-10 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            New to the ecosystem?{' '}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 transition-colors ml-1">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
