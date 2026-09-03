'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Event, EventRegistration } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventHero } from '@/components/events/EventHero';
import { DynamicRegistrationForm } from '@/components/events/DynamicRegistrationForm';
import { InstantPass } from '@/components/events/InstantPass';
import { PassLookupModal } from '@/components/events/PassLookupModal';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Users, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SingleEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pass is NEVER pre-loaded from storage — always starts blank.
  // A user only sees their own pass after:
  //   (a) they just completed registration in this browser tab, OR
  //   (b) they explicitly look it up via "Find My Pass" with their own email.
  // This prevents any cross-user data leakage.
  const [currentRegistration, setCurrentRegistration] = useState<EventRegistration | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Purge any old cached passes that may have been stored by a previous version
  // of this app — ensures old attendee data cannot leak to new visitors
  useEffect(() => {
    if (!slug) return;
    try {
      const legacyKey = `registerhub_event_reg_${slug}`;
      if (localStorage.getItem(legacyKey)) {
        localStorage.removeItem(legacyKey);
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

  // After successful registration: show pass only in this tab's memory (not persisted)
  const handleRegistrationSuccess = (reg: EventRegistration) => {
    setCurrentRegistration(reg);
    handleScrollToRegister();
  };

  // After explicit "Find My Pass" lookup: show only the matched user's own pass
  const handleFoundRegistration = (reg: EventRegistration) => {
    setCurrentRegistration(reg);
    handleScrollToRegister();
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Curating Summit Experience...
        </span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl text-center space-y-4 max-w-md shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Summit Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This assembly does not exist or has been archived by executive administration.'}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover All Summits</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-white">
      {/* Top Floating Navbar */}
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

      <PageTransition className="flex-1 flex flex-col">
        {/* Hero Section */}
        <EventHero
          event={event}
          onScrollToRegister={handleScrollToRegister}
          onOpenLookup={() => setIsLookupOpen(true)}
        />

        {/* Interactive Content Sections */}
        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 flex-1 w-full">
          {/* Privacy-Safe Live Attendance Metric Bar */}
          <AnimatedSection variant="fadeSlideUp" className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 backdrop-blur-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wider uppercase text-[11px]">Verified Attendance Metric:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-slate-300 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{event.registration_count || 0} Confirmed Delegates</span>
              </div>

              {event.max_capacity > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  <span>Capacity:</span>
                  <span className="font-semibold text-white">
                    {Math.max(0, event.max_capacity - (event.registration_count || 0))} seats remaining
                  </span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct Digital Credentialing Active</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Main Interactive Pass or Form */}
          <AnimatedSection variant="fadeSlideUp" delay={0.15}>
            <section id="register-section" className="scroll-mt-32">
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
          </AnimatedSection>
        </main>
      </PageTransition>

      {/* Modals */}
      <PassLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        eventId={event.id}
        onFound={handleFoundRegistration}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Cryptographically Signed Attendee Badges</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/events" className="text-amber-400 hover:text-amber-300 transition-colors">
              &larr; Discover Other Summits
            </Link>
            <span>RegisterHub &copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}