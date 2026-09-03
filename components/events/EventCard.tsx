'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Event } from '@/types';
import { Calendar, Users, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const startDate = new Date(event.start_date);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-3xl bg-slate-950/40 backdrop-blur-2xl border border-white/10 overflow-hidden group hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col justify-between"
    >
      {/* Media Thumbnail */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
        {event.media_type === 'image' && event.media_url ? (
          <img
            src={event.media_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-label={`${event.title} preview video`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
          >
            <source
              src={event.media_url || 'https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4'}
              type="video/mp4"
            />
            <track kind="captions" srcLang="en" label="English" default={false} />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-pulse" />
            Accreditation Open
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
          <span className="flex items-center gap-1.5 font-semibold bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md text-white">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-semibold bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md text-white">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            {event.registration_count || 0} Registered
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1 tracking-tight">
            {event.title}
          </h2>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {event.description || 'Distinguished global summit convenes premier engineers, founders, and industry luminaries.'}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Complimentary Pass
          </span>

          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-200 group-hover:translate-x-0.5"
          >
            <span>View &amp; Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};