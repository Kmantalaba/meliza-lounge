'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Enter a valid email address'),
  password:  z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFields    = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, register } = useApp();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFields>({ resolver: zodResolver(registerSchema) });

  // Reset forms on mode change
  useEffect(() => {
    loginForm.reset();
    registerForm.reset();
    setShowPwd(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAuthModal(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setShowAuthModal]);

  if (!showAuthModal) return null;

  const onLogin = async (data: LoginFields) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFields) => {
    setIsLoading(true);
    try {
      await register(data.firstName, data.lastName, data.email, data.password);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#FFF0F7] to-[#FDE8F3] px-8 pt-8 pb-6">
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-[#525252]" />
          </button>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              <Image
                src="/meliza_logo.png"
                alt="The Meliza Lounge"
                fill
                className="object-contain"
                sizes="44px"
                priority
              />
            </div>
            <span
              className="text-[#E91E8C] font-bold text-lg"
              style={{ fontFamily: 'var(--font-dancing)' }}
            >
              The Meliza Lounge
            </span>
          </div>
          <h2
            className="text-2xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {authMode === 'login'
              ? 'Log in to book and manage your appointments'
              : 'Join us and start your nail journey'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-pink-100 mx-8 mt-6">
          {(['login', 'register'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAuthMode(mode)}
              className={`flex-1 pb-3 text-sm font-semibold capitalize transition-all duration-200 border-b-2 -mb-px ${
                authMode === mode
                  ? 'border-[#E91E8C] text-[#E91E8C]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#525252]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="px-8 py-6">
          {authMode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <input
                  {...loginForm.register('email')}
                  placeholder="Email / Username"
                  className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    loginForm.formState.errors.email ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  {...loginForm.register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    loginForm.formState.errors.password ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#525252]"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-pink-200 flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Logging in…</> : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    {...registerForm.register('firstName')}
                    placeholder="First name *"
                    className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                      registerForm.formState.errors.firstName ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                    }`}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...registerForm.register('lastName')}
                    placeholder="Last name *"
                    className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                      registerForm.formState.errors.lastName ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                    }`}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="Email address *"
                  className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    registerForm.formState.errors.email ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  {...registerForm.register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password (min. 6 chars) *"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    registerForm.formState.errors.password ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#525252]"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {registerForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Confirm password *"
                  className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    registerForm.formState.errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-pink-200 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
