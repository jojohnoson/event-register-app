'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserPlus, Sparkles, Lock, ShieldCheck,
  Ticket, LogOut, Calendar,
} from 'lucide-react';

interface NavbarProps {
  totalUsers: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenLookup: () => void;
  onScrollToRegister: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenLookup,
  onScrollToRegister,
  onAdminLogout,
}) => {
  return (
    /* ── Floating Glassmorphic Navigation Bar ──────────────────────────────
       Fixed at the top of the viewport, centred horizontally. Never disrupts
       document flow — page content carries a top-padding offset instead.    */
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      <div className="rounded-2xl backdrop-blur-2xl bg-slate-950/85 border border-white/15 shadow-2xl shadow-black/60 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand Identity */}
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
          <Link href="/events" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
              <UserPlus className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight leading-none">
                  RegisterHub
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Multi-Event
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block mt-0.5">
                Dynamic Event Architecture Platform
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Centre Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-200">
          <Link
            href="/events"
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200 group"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>All Summits</span>
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-px w-0 bg-amber-400 group-hover:w-3/4 transition-all duration-300 rounded-full" />
          </Link>
          <motion.button
            onClick={onScrollToRegister}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-3.5 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            Register Now
          </motion.button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">

          {/* Find My Pass — Primary CTA */}
          <motion.button
            onClick={onOpenLookup}
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
            whileTap={{ scale: 0.96 }}
            title="Retrieve your verified digital attendee pass"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/35 hover:border-amber-400/50 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Find My Pass</span>
          </motion.button>

          {/* Admin Access */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded-xl hover:bg-amber-400/25 transition-all duration-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Active</span>
              </Link>
              <motion.button
                onClick={onAdminLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Sign out of Administrator session"
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-white/15 hover:border-rose-500/30 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all duration-200"
              >
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <span>Admin</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};