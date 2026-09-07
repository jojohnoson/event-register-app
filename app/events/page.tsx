'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/events/EventCard';
import { FAQSection } from '@/components/events/FAQSection';
import { PassLookupModal } from '@/components/events/PassLookupModal';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Sparkles, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export default function EventsListingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (e) {
        console.error('Error fetching events:', e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-white">
      {/* Floating Navbar */}
      <Navbar
        totalUsers={events.reduce((acc, e) => acc + (e.registration_count || 0), 0)}
        isAdmin={false}
        onOpenAdminLogin={() => {
          window.location.href = '/admin';
        }}
        onOpenLookup={() => setIsLookupOpen(true)}
        onScrollToRegister={() => {
          const el = document.getElementById('summits-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onAdminLogout={() => {}}
      />

      {/* Main Content Area */}
      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-bold text-amber-300 backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Premier Global Assembly Directory
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
            World-Class Tech Summits &amp; Executive Conclaves
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed drop-shadow">
            Acquire bespoke credentials, reserve priority track admissions, and engage directly with foremost luminaries shaping tomorrow&apos;s digital frontiers.
          </p>
        </div>

        {/* Events Grid */}
        <div id="summits-grid" className="scroll-mt-32">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs uppercase tracking-widest font-semibold">Retrieving Verified Summits...</span>
            </div>
          ) : events.length === 0 ? (
            <AnimatedSection className="p-12 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/10 text-center space-y-4 max-w-md mx-auto shadow-2xl">
              <Calendar className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <h3 className="text-xl font-bold text-white tracking-tight">No Active Public Conclaves</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                New summits are presently undergoing accreditation. Please review in due course or enter the administrator suite.
              </p>
              <Link
                href="/admin"
                className="inline-block mt-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Enter Administrator Portal
              </Link>
            </AnimatedSection>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl w-full mx-auto">
                {events.map((event, idx) => (
                  <AnimatedSection key={event.id} delay={idx * 0.1} className="w-full flex">
                    <EventCard event={event} />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Curated Frequently Asked Questions Section */}
        <AnimatedSection delay={0.2} variant="fadeSlideUp">
          <FAQSection />
        </AnimatedSection>
      </PageTransition>

      {/* Global Multi-Event Pass Lookup Modal */}
      <PassLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted &bull; Instant Digital Credentialing</span>
          </div>
          <div className="flex items-center gap-4">
            <span>RegisterHub &copy; 2026</span>
            <Link href="/admin" className="text-slate-400 hover:text-amber-300 transition-colors">
              Administrator Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}