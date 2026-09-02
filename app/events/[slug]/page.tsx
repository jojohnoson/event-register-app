'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Event, EventRegistration } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventHero } from '@/components/events/EventHero';
import { DynamicRegistrationForm } from '@/components/events/DynamicRegistrationForm';
import { InstantPass } from '@/components/events/InstantPass';
import { PassLookupModal } from '@/components/events/PassLookupModal';
import { Sparkles, Users, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SingleEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentRegistration, setCurrentRegistration] = useState<EventRegistration | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Restore saved registration for this specific event if available in localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(`registerhub_event_reg_${slug}`);
      if (saved) {
        setCurrentRegistration(JSON.parse(saved));
      }
    } catch {}
  }, [slug]);

  const fetchEvent = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${slug}`);
      const data = await res.json();
      if (!res.ok || !data.event) {
        throw new Error(data.error || 'Event not found');
      }
      setEvent(data.event);
    } catch (e: any) {
      setError(e.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleScrollToRegister = () => {
    const el = document.getElementById('register-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegistrationSuccess = (reg: EventRegistration) => {
    setCurrentRegistration(reg);
    try {
      localStorage.setItem(`registerhub_event_reg_${slug}`, JSON.stringify(reg));
    } catch {}
    handleScrollToRegister();
  };

  const handleFoundRegistration = (reg: EventRegistration) => {
    setCurrentRegistration(reg);
    try {
      localStorage.setItem(`registerhub_event_reg_${slug}`, JSON.stringify(reg));
    } catch {}
    handleScrollToRegister();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Loading Event Experience...
        </span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-white flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Event Unavailable</h2>
          <p className="text-xs text-slate-400">
            {error || 'This event does not exist or has been archived by the administrator.'}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-bold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        totalUsers={event.registration_count || 0}
        isAdmin={false}
        onOpenAdminLogin={() => {
          window.location.href = '/admin';
        }}
        onOpenLookup={() => setIsLookupOpen(true)}
        onScrollToRegister={handleScrollToRegister}
        onAdminLogout={() => {}}
      />

      {/* Hero with Looping Video & High-Precision Countdown Timer */}
      <EventHero
        event={event}
        onScrollToRegister={handleScrollToRegister}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Interactive Content Sections */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full">
        {/* CREATIVE FEATURE: Real-Time Live Attendee Feed */}
        {event.recent_attendees && event.recent_attendees.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Attendee Activity Feed:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
              {event.recent_attendees.map((att, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 shrink-0 text-[11px]"
                >
                  <Users className="w-3 h-3 text-amber-400" />
                  <span><strong>{att.name}</strong></span>
                  {att.organization && (
                    <span className="text-slate-400">&bull; {att.organization}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Interactive Pass or Form */}
        <section id="register-section" className="scroll-mt-28">
          {currentRegistration ? (
            <InstantPass
              registration={currentRegistration}
              event={event}
              onRegisterAnother={() => setCurrentRegistration(null)}
            />
          ) : (
            <DynamicRegistrationForm
              event={event}
              onSuccess={handleRegistrationSuccess}
              onOpenLookup={() => setIsLookupOpen(true)}
            />
          )}
        </section>
      </main>

      {/* Modals */}
      <PassLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        eventId={event.id}
        onFound={handleFoundRegistration}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080a0f]/80 backdrop-blur-md py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Cryptographically Signed Attendee Badges</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/events" className="text-amber-400 hover:underline">
              &larr; View Other Summits
            </Link>
            <span>RegisterHub &copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}