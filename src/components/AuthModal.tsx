import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Strict East West University student mail verification
  // Format: 2022-1-60-001@std.ewubd.edu or any valid EWU student email
  const validateEwuStudentEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim().toLowerCase();
    // Allow either exact student ID format or any @std.ewubd.edu
    return /^[0-9]{4}-[1-3]-[0-9]{2}-[0-9]{3}@std\.ewubd\.edu$/.test(trimmed) || 
           trimmed.endsWith('@std.ewubd.edu');
  };

  const extractStudentId = (emailStr: string): string => {
    const prefix = emailStr.split('@')[0];
    return prefix;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Strict verification
    if (!validateEwuStudentEmail(cleanEmail)) {
      setErrorMsg('Access Restricted: Only East West University student emails (e.g. 2022-1-60-123@std.ewubd.edu) are permitted to upload.');
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
          // If already exists, attempt automatic sign-in
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
          // Check if session immediately available or confirmation sent
          if (data.session) {
            onSuccess(data.user);
            onClose();
          } else {
            setSuccessMsg('Account created! If email confirmation is required, please check your @std.ewubd.edu inbox.');
          }
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          // If login fails because user doesn't exist yet, offer auto-signup
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
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
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
            Strictly for East West University Students
          </p>
        </div>

        {/* Domain Notice Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">EWU Student Requirement:</span>
            <p className="mt-0.5 text-purple-300">
              You must use your institutional email ending in <strong className="text-white font-mono">@std.ewubd.edu</strong>.
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
              EWU Student Email (@std.ewubd.edu)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="2022-1-60-xxx@std.ewubd.edu"
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
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Contributor Account' : 'Sign In'}</span>
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
