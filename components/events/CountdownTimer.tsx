'use client';

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
