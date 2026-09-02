'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const EventCountdown: React.FC = () => {
  // Target event date: e.g. 45 days from current date or fixed future date
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 14,
    minutes: 36,
    seconds: 20,
  });

  useEffect(() => {
    // Dynamic countdown calculation to a fixed future conference kickoff
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45);
    targetDate.setHours(9, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-sm">
      {/* Ambient warm glow */}
      <div className="absolute top-0 right-1/4 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Event Key Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Tech &amp; Cloud Summit 2026</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Official Registration is Live &bull; Event Kickoff Countdown
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span className="text-slate-200 font-medium">October 15 - 17, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200">San Francisco Convention Center &amp; Virtual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Instant Digital Pass</span>
            </div>
          </div>
        </div>

        {/* Countdown Ticker Box */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-center min-w-[65px] sm:min-w-[80px] shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Days
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-center min-w-[65px] sm:min-w-[80px] shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Hours
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-center min-w-[65px] sm:min-w-[80px] shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Mins
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[65px] sm:min-w-[80px] shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight animate-pulse">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-300 mt-0.5">
              Secs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




