'use client';

import React, { useState } from 'react';
import { Search, Mail, X, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Registration } from '@/types';

interface LookupRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFound: (user: Registration) => void;
}

export const LookupRegistrationModal: React.FC<LookupRegistrationModalProps> = ({
  isOpen,
  onClose,
  onFound,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/my-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration record not found.');
      }

      if (data.user) {
        onFound(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Could not find a registration for that email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient warm glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 w-fit mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Private Lookup
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          Find My Registration Pass
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Enter the email address you used when registering to retrieve your digital attendee ticket.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Your Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. john@example.com"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)] transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Looking up...</span>
                </>
              ) : (
                <>
                  <span>Find My Pass</span>
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




