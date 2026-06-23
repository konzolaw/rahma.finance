'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, CheckCircle, EyeOff, Eye, ArrowRight, Loader } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const email = watch('email');
  const password = watch('password');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setApiError(null);
      setSuccessMessage(false);
      
      const response = await authApi.login({ email: data.email, password: data.password });
      
      setAccessToken(response.data.access_token);
      setUser(response.data.user);
      setSuccessMessage(true);
      
      // Give user feedback before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Invalid email or password. Please try again.';
      setApiError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
          <Lock className="text-teal-400" size={24} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-sm">
          Sign in to manage your finances
        </p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0 flex-shrink-0" />
          <span className="text-sm">{apiError}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-in slide-in-from-top-2">
          <CheckCircle size={18} className="mt-0.5 shrink-0 flex-shrink-0" />
          <span className="text-sm">Login successful! Redirecting...</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-[#1f2d5c]/80 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={16} />
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500 focus:bg-teal-500/5 transition-all text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
                aria-label="Forgot password"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={16} />
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500 focus:bg-teal-500/5 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-white/5 pt-6">
          <p className="text-gray-400 text-xs">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 transition-colors font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
