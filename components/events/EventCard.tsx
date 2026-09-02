'use client';

import React from 'react';
import Link from 'next/link';
import { Event } from '@/types';
import { Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="w-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden group hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col justify-between">
      {/* Media Thumbnail */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
        {event.media_type === 'image' && event.media_url ? (
          <img
            src={event.media_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          >
            <source
              src={event.media_url || 'https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4'}
              type="video/mp4"
            />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-stone-900 shadow-md">
            Open Registration
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-semibold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            {event.registration_count || 0} Registered
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description || 'Global tech summit gathering engineers, founders, and leaders.'}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Free Instant Pass
          </span>

          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-stone-900 font-bold text-xs transition-colors"
          >
            <span>View &amp; Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};