'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { Registration } from '@/types';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Registration;
  onViewPass: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  user,
  onViewPass,
}) => {
  if (!isOpen) return null;

  const formattedId = `REG-${user.id.toString().padStart(5, '0')}`;
  const isFree = user.payment_status === 'FREE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden text-center">
        {/* Ambient warm glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Celebration Icon */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Badge and Title */}
        <div className="relative z-10 mt-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isFree ? 'Registration Confirmed' : 'Payment Verified & Confirmed'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            Welcome to Global Tech Summit 2026!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Your registration is confirmed. We&apos;ve issued your official digital attendee badge below.
          </p>
        </div>

        {/* Ticket Summary Card */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-3 text-left text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-slate-400">Attendee Name:</span>
            <span className="font-bold text-white">{user.name}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-slate-400">Badge ID:</span>
            <span className="font-mono font-bold text-amber-400">{formattedId}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-slate-400">Pass Tier:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-950 border border-amber-500/30">
              {user.ticket_type || 'General Access'}
            </span>
          </div>

          {user.payment_id && (
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono text-[11px] text-slate-200 truncate max-w-[200px]">{user.payment_id}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Status:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFree ? 'COMPLIMENTARY PASS' : 'PAID IN FULL'}</span>
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewPass();
            }}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-50 text-xs font-bold shadow-md shadow-stone-900/15 transition"
          >
            <span>View My Digital Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};




