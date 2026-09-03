'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Event } from '@/types';
import { CountdownTimer } from '@/components/events/CountdownTimer';
import { Calendar, MapPin, Sparkles, Ticket, UserCheck, ShieldCheck } from 'lucide-react';

interface EventHeroProps {
  event: Event;
  onScrollToRegister: () => void;
  onOpenLookup: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({
  event,
  onScrollToRegister,
  onOpenLookup,
}) => {
  const startDate = new Date(event.start_date);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isLive = new Date().getTime() >= startDate.getTime() && new Date().getTime() <= new Date(event.end_date).getTime();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden">
      {/* Subtle Ambient Radial Glows overlaying the persistent Global Video */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-blue-500/10 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      {/* Hero Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
      >
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/60 border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-2xl shadow-xl">
          {isLive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-400 uppercase tracking-widest font-bold">Summit In Progress</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 uppercase tracking-widest font-bold">Official Registration Active</span>
            </>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">Direct Digital Accreditation</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          {event.title}
        </h1>

        {/* Description */}
        {event.description && (
          <p className="text-base sm:text-xl text-slate-300/90 max-w-3xl mx-auto font-light leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Date & Location Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-2xl border border-white/10 shadow-sm">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-2xl border border-white/10 shadow-sm">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Hybrid &bull; Executive Auditorium &amp; Global Broadcast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/50 backdrop-blur-2xl border border-white/10 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Cryptographic Pass</span>
          </div>
        </div>

        {/* Real-Time Countdown Timer */}
        <div className="pt-2 pb-2">
          <CountdownTimer
            targetDate={event.registration_deadline || event.start_date}
            label={event.registration_deadline ? 'Accreditation Closes In' : 'Summit Commences In'}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(245,158,11,0.45)' }}
            whileTap={{ scale: 0.96 }}
            onClick={onScrollToRegister}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm sm:text-base font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-200"
          >
            <UserCheck className="w-5 h-5" />
            <span>Register Now &bull; Complimentary Pass</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLookup}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-950/50 hover:bg-slate-900/70 border border-white/10 hover:border-white/20 text-white text-sm sm:text-base font-semibold backdrop-blur-2xl transition-all duration-200"
          >
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Find My Pass</span>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};
