'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_: ForgotPasswordFormValues) => {
    try {
      // Mock API call - in a real app, this would call authApi.forgotPassword
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-gray-400">We'll send you a link to reset it</p>
      </div>

      <div className="bg-[#1f2d5c] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              We've sent a password reset link to your email address.
            </p>
            <Link 
              href="/login"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-[#1B2A4A] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>
                {errors.email && <span className="text-red-400 text-xs ml-1">{errors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-900/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center relative z-10 border-t border-white/5 pt-6">
              <Link href="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
