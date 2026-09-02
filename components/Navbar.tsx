'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, Sparkles, Lock, ShieldCheck, Ticket, LogOut, Calendar } from 'lucide-react';

interface NavbarProps {
  totalUsers: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenLookup: () => void;
  onScrollToRegister: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalUsers,
  isAdmin,
  onOpenAdminLogin,
  onOpenLookup,
  onScrollToRegister,
  onAdminLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080a0f]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/events" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">
                RegisterHub
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" /> Multi-Event
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Dynamic Event Architecture Platform
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Link
            href="/events"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>All Summits</span>
          </Link>
          <button
            onClick={onScrollToRegister}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition"
          >
            Register Now
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Find Pass Button */}
          <button
            onClick={onOpenLookup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition shadow-sm"
            title="Retrieve your digital attendee pass"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>Find My Pass</span>
          </button>

          {/* Admin Dashboard Access */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Active</span>
              </Link>
              <button
                onClick={onAdminLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 transition"
                title="Log out of Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};