'use client';

import React, { useState, useEffect } from 'react';
import { Event } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/events/EventCard';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function EventsListingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-white">
      {/* Global Ambient Loop Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover scale-105 opacity-40"
        >
          <source
            src="https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080a0f]/40 via-[#080a0f]/70 to-[#080a0f]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      </div>

      {/* Navbar */}
      <Navbar
        totalUsers={events.reduce((acc, e) => acc + (e.registration_count || 0), 0)}
        isAdmin={false}
        onOpenAdminLogin={() => {
          window.location.href = '/admin';
        }}
        onOpenLookup={() => {}}
        onScrollToRegister={() => {}}
        onAdminLogout={() => {}}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-fadeUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Multi-Event Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Discover Global Tech Summits &amp; Exclusive Conferences
          </h1>

          <p className="text-base sm:text-lg text-slate-300/80 font-light">
            Claim instant digital passes, select personalized conference tracks, and sync live countdowns to your schedule without any payment walls.
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs uppercase tracking-widest font-semibold">Loading Events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-white">No Public Events Live Right Now</h3>
            <p className="text-xs text-slate-400">
              Check back shortly or visit the admin portal to publish an event schedule.
            </p>
            <a
              href="/admin"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-900 font-bold text-xs shadow-md"
            >
              Go to Admin Dashboard
            </a>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex flex-wrap items-stretch justify-center gap-6 sm:gap-8 max-w-6xl w-full mx-auto">
              {events.map((event) => (
                <div key={event.id} className="w-full sm:w-[380px] lg:w-[400px] flex">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#080a0f]/80 backdrop-blur-md py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted &bull; Direct Instant Pass Issuance</span>
          </div>
          <div className="flex items-center gap-4">
            <span>RegisterHub &copy; 2026</span>
            <a href="/admin" className="text-slate-400 hover:text-white transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}