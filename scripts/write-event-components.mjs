import fs from 'fs';
import path from 'path';

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote: ${filePath}`);
}

// 1. components/events/CountdownTimer.tsx
writeFile('components/events/CountdownTimer.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label = 'Event Starts In',
  onExpire,
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 backdrop-blur-xl shadow-lg">
        <AlertTriangle className="w-5 h-5 text-rose-400" />
        <span className="text-sm font-bold tracking-wide">
          Registration Closed or Event Concluded
        </span>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hours', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Minutes', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
          <Clock className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group hover:border-amber-500/40 transition-all duration-300 min-w-[70px] sm:min-w-[95px]"
          >
            <span className="text-2xl sm:text-4xl font-mono font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
              {block.value}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
`);

// 2. components/events/EventHero.tsx
writeFile('components/events/EventHero.tsx', `'use client';

import React from 'react';
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
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Media */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {event.media_type === 'image' && event.media_url ? (
          <img
            src={event.media_url}
            alt={event.title}
            className="absolute w-full h-full object-cover scale-105"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full object-cover scale-105"
          >
            <source
              src={event.media_url || 'https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4'}
              type="video/mp4"
            />
          </video>
        )}

        {/* Ambient Dark Gradient & Soft Blur Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080a0f]/30 via-[#080a0f]/60 to-[#080a0f]/95"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fadeUp">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xl shadow-xl">
          {isLive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-400 uppercase tracking-wider">Event Live Now</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 uppercase tracking-wider">Official Registration Open</span>
            </>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Direct Pass Access</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          {event.title}
        </h1>

        {/* Description */}
        {event.description && (
          <p className="text-base sm:text-xl text-slate-300/80 max-w-3xl mx-auto font-light leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Date & Location Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Hybrid &bull; Main Convention Center + Global Live Broadcast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant QR Badge Issued</span>
          </div>
        </div>

        {/* Real-Time Countdown Timer */}
        <div className="pt-2 pb-4">
          <CountdownTimer
            targetDate={event.registration_deadline || event.start_date}
            label={event.registration_deadline ? 'Registration Closes In' : 'Event Commences In'}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onScrollToRegister}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm sm:text-base font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all duration-300 active:scale-95"
          >
            <UserCheck className="w-5 h-5" />
            <span>Register Now &bull; Free Pass</span>
          </button>

          <button
            onClick={onOpenLookup}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-white text-sm sm:text-base font-semibold backdrop-blur-xl transition-all duration-300"
          >
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Find My Pass</span>
          </button>
        </div>
      </div>
    </section>
  );
};
`);

console.log('Event components (Countdown & Hero) written successfully!');