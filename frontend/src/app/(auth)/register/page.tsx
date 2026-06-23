'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, EyeOff, Eye, ArrowRight, Loader, Check } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
  display_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  
  if (!password) return { score: 0, label: '', color: '' };
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const strengthLevels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: 'text-red-400' },
    { score: 2, label: 'Fair', color: 'text-yellow-400' },
    { score: 3, label: 'Good', color: 'text-blue-400' },
    { score: 4, label: 'Strong', color: 'text-green-400' },
  ];
  
  const fallback: PasswordStrength = { score: 0, label: '', color: '' };
  return strengthLevels[Math.min(score, 4)] || fallback;
};

export default function RegisterPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirm_password') || '';
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setApiError(null);
      setSuccessMessage(false);
      
      await authApi.register({ 
        email: data.email, 
        password: data.password, 
        display_name: data.display_name,
        password_confirm: data.confirm_password
      });
      
      const response = await authApi.login({ email: data.email, password: data.password });
      
      setAccessToken(response.data.access_token);
      setUser(response.data.user);
      setSuccessMessage(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.email?.[0] || 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Registration failed. Please try again.';
      setApiError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <UserIcon className="text-emerald-400" size={24} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Account
        </h1>
        <p className="text-gray-400 text-sm">
          Start managing your finances today
        </p>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm">{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-in slide-in-from-top-2">
          <CheckCircle size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm">Account created! Signing you in...</span>
        </div>
      )}

      <div className="bg-[#1f2d5c]/80 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="space-y-2">
            <label htmlFor="display_name" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input
                {...register('display_name')}
                id="display_name"
                type="text"
                placeholder="John Doe"
                aria-label="Full name"
                aria-invalid={!!errors.display_name}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all text-sm"
              />
            </div>
            {errors.display_name && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.display_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all text-sm"
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

            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                <span className={password.length >= 8 ? 'text-gray-300' : 'text-gray-500'}>8+ characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-gray-300' : 'text-gray-500'}>Uppercase & lowercase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                <span className={/[0-9]/.test(password) ? 'text-gray-300' : 'text-gray-500'}>At least one number</span>
              </div>

              {password && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Strength:</span>
                    <span className={`font-semibold ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full ${
                          i < passwordStrength.score
                            ? passwordStrength.score === 1
                              ? 'bg-red-400'
                              : passwordStrength.score === 2
                              ? 'bg-yellow-400'
                              : passwordStrength.score === 3
                              ? 'bg-blue-400'
                              : 'bg-green-400'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.password && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input
                {...register('confirm_password')}
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                aria-label="Confirm password"
                aria-invalid={!!errors.confirm_password}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && !errors.confirm_password && (
              <p className="text-xs text-green-400 flex items-center gap-1 ml-1">
                <Check size={14} />
                Passwords match
              </p>
            )}
            {errors.confirm_password && (
              <p className="text-xs text-red-400 flex items-center gap-1 ml-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password || password !== confirmPassword}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/5 pt-6">
          <p className="text-gray-400 text-xs">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
