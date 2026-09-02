'use client';

import React, { useState } from 'react';
import { EventRegistration } from '@/types';
import { Search, X, Loader2, AlertCircle, Ticket } from 'lucide-react';

interface PassLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: number;
  onFound: (reg: EventRegistration) => void;
}

export const PassLookupModal: React.FC<PassLookupModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onFound,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      const url = eventId
        ? `/api/registrations/lookup?email=${encodeURIComponent(email.trim())}&event_id=${eventId}`
        : `/api/registrations/lookup?email=${encodeURIComponent(email.trim())}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No registered pass found for this email address.');
      }

      if (data.registration) {
        onFound(data.registration);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Find Existing Pass</h3>
            <p className="text-xs text-slate-400">Retrieve your verified QR attendee ticket</p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Your Registered Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. your.email@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm transition shadow-md disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Database...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Retrieve My Pass</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};