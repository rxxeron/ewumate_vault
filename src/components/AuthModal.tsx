import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onOpenAppModal: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenAppModal
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validate student email or authorized administrator account
  const validateAllowedEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim().toLowerCase();
    
    // 1. Allow institutional student emails
    if (
      /^[0-9]{4}-[1-3]-[0-9]{2}-[0-9]{3}@std\.ewubd\.edu$/.test(trimmed) || 
      trimmed.endsWith('@std.ewubd.edu') ||
      trimmed.endsWith('@ewubd.edu')
    ) {
      return true;
    }

    // 2. Allow administrative / owner accounts
    const adminEmails = [
      'rhrakibulhasan279@gmail.com',
      'rakibulhasan@ewubd.edu',
      'rxxeron@gmail.com'
    ];
    if (adminEmails.includes(trimmed)) {
      return true;
    }

    return false;
  };

  const extractStudentId = (emailStr: string): string => {
    return emailStr.split('@')[0];
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const redirectTo = `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setErrorMsg(err.message || 'Failed to initialize Google Sign In');
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if allowed
    if (!validateAllowedEmail(cleanEmail)) {
      setErrorMsg('Access Restricted: Please sign in with your East West University student email (e.g. 2022-1-60-123@std.ewubd.edu).');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || cleanEmail.split('@')[0],
              student_id: extractStudentId(cleanEmail)
            }
          }
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: password
            });
            if (signInError) throw signInError;
            if (signInData.user) {
              onSuccess(signInData.user);
              onClose();
              return;
            }
          }
          throw error;
        }

        if (data.user) {
          if (data.session) {
            onSuccess(data.user);
            onClose();
          } else {
            setSuccessMsg('Account created! If email confirmation is required, please check your inbox.');
          }
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid password or account does not exist. If you are new, switch to "Create Account" below!');
          } else {
            throw error;
          }
          return;
        }

        if (data.user) {
          onSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-600/30">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">
            {isSignUp ? 'Join Vault as a Contributor' : 'Sign In to Upload'}
          </h2>
          <p className="text-xs text-purple-300 font-medium mt-1">
            East West University Portal
          </p>
        </div>

        {/* Domain Notice Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">EWU Institutional Sign In:</span>
            <p className="mt-0.5 text-purple-300">
              Sign in with Google or your university account (<strong className="text-white font-mono">@std.ewubd.edu</strong>).
            </p>
          </div>
        </div>

        {/* Alert Errors */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 font-bold text-sm text-slate-100 shadow-sm active:scale-95 disabled:opacity-50 mb-5 group"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-black">
            <span className="px-3 bg-slate-900 text-slate-500">Or with student email</span>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rakibul Hasan"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="xxxx-x-xx-xxx@std.ewubd.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                }}
                className="text-purple-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              First time contributor?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                }}
                className="text-purple-400 hover:underline font-bold"
              >
                Create an account
              </button>
            </span>
          )}
        </div>

        {/* App suggestion banner */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">
            Want schedule alerts & CGPA projections?
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAppModal();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Discover the EWUmate App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
