'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventRegistration } from '@/types';
import {
  Search, X, Loader2, AlertCircle, Ticket, Calendar,
  Building2, Briefcase, ShieldCheck, ArrowRight, Copy,
  Check, ExternalLink, Sparkles
} from 'lucide-react';

interface PassLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: number;
  onFound?: (reg: EventRegistration) => void;
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
  const [foundRegistrations, setFoundRegistrations] = useState<EventRegistration[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFoundRegistrations(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
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
        throw new Error(data.error || 'No registered passes found for this email address.');
      }

      if (eventId && data.registration) {
        // Specific event mode
        if (onFound) {
          onFound(data.registration);
          onClose();
          return;
        }
        setFoundRegistrations([data.registration]);
      } else if (data.registrations && data.registrations.length > 0) {
        setFoundRegistrations(data.registrations);
      } else if (data.registration) {
        setFoundRegistrations([data.registration]);
      } else {
        throw new Error('No registered pass found.');
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFoundRegistrations(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full ${foundRegistrations && foundRegistrations.length > 1 ? 'max-w-2xl' : 'max-w-lg'} rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 transition-all`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tight">
                {eventId ? 'Find My Summit Pass' : 'Find My Registered Passes'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                {eventId ? 'This Event' : 'All Summits'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {eventId
                ? 'Lookup your official pass for this specific event'
                : 'Enter your email to view credentials for all summits you have registered for'}
            </p>
          </div>
        </div>

        {/* State A: Lookup Search Form */}
        {!foundRegistrations ? (
          <form onSubmit={handleLookup} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. joeljohnson2514@gmail.com"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                  <span>Searching Summit Database...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{eventId ? 'Find Event Pass' : 'Retrieve All My Passes'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* State B: Results Displayed (Single or Multiple Registered Passes) */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Found <strong className="text-amber-400">{foundRegistrations.length}</strong> Registered Pass{foundRegistrations.length > 1 ? 'es' : ''} for <span className="text-slate-300">{email}</span>
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                Search Another Email
              </button>
            </div>

            {/* Passes List */}
            <div className="max-h-[60vh] overflow-y-auto space-y-3.5 pr-1">
              {foundRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/50 shadow-md space-y-3 transition"
                >
                  {/* Top Bar: Event Title & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Registered Summit
                      </span>
                      <h4 className="text-base font-black text-white leading-snug">
                        {reg.event_title || 'Global Tech Summit'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                      {reg.is_early_bird && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">
                          🎯 Early Bird
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {reg.checked_in ? 'Checked In' : 'Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Unique Credential ID
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-black text-amber-400 tracking-wider">
                          {reg.attendee_id}
                        </span>
                        <button
                          onClick={() => handleCopyId(reg.attendee_id)}
                          className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
                          title="Copy Credential ID"
                        >
                          {copiedId === reg.attendee_id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Delegate Name
                      </span>
                      <p className="font-bold text-white truncate mt-0.5">{reg.name}</p>
                    </div>

                    {reg.event_start_date && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Summit Date
                        </span>
                        <p className="font-medium text-slate-300 truncate mt-0.5">
                          {new Date(reg.event_start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {reg.organization && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Organization
                        </span>
                        <p className="font-medium text-slate-300 truncate mt-0.5">{reg.organization}</p>
                      </div>
                    )}

                    {reg.role && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Role / Title
                        </span>
                        <p className="font-medium text-slate-300 truncate mt-0.5">{reg.role}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Registered On
                      </span>
                      <p className="font-medium text-slate-400 truncate mt-0.5">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this Registration */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    {reg.event_slug && (
                      <Link
                        href={`/events/${reg.event_slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold transition"
                      >
                        <span>Open Summit Page &amp; Pass</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {onFound && (
                      <button
                        onClick={() => {
                          onFound(reg);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold transition ml-auto"
                      >
                        <span>Display Full Pass</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};