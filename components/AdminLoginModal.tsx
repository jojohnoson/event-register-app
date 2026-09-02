'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, X, Loader2, AlertCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Incorrect password.');
      }

      if (data.token) {
        // Save token to localStorage for convenience
        localStorage.setItem('registerhub_admin_token', data.token);
        onLoginSuccess(data.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient background warm glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-700/5 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 flex items-center justify-center text-amber-100 shadow-md shadow-amber-900/15">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Staff &amp; Organizers
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Admin Portal Login
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          Enter your administrative key to unlock the attendee database, double-verification security deletion, CSV export, and live controls.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password..."
                required
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-50 text-xs font-bold shadow-md shadow-stone-900/15 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Unlock Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




