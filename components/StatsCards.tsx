'use client';

import React from 'react';
import { Users, Building2, UserCheck, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { RegistrationStats } from '@/types';

interface StatsCardsProps {
  stats: RegistrationStats;
  isAdmin?: boolean;
  onOpenAdminDirectory?: () => void;
  onOpenLookup?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  isAdmin = false,
  onOpenAdminDirectory,
  onOpenLookup,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Card 1: Total Registered */}
      <div 
        onClick={isAdmin ? onOpenAdminDirectory : undefined}
        className={`group relative p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm transition-all duration-300 ${
          isAdmin 
            ? 'cursor-pointer hover:border-amber-700/60 hover:shadow-md hover:-translate-y-0.5' 
            : 'hover:border-stone-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TOTAL REGISTERED
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30/80 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {stats.total}
          </span>
          {isAdmin ? (
            <span className="inline-flex items-center text-xs font-semibold text-amber-300 group-hover:text-amber-400">
              Admin list <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/10 text-slate-300 border border-white/20">
              Live Count
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">Live attendees in database</p>
      </div>

      {/* Card 2: Organizations */}
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-amber-600/40 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ORGANIZATIONS
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {stats.organizations}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Unique companies & orgs</p>
      </div>

      {/* Card 3: Average Age */}
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-amber-600/40 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AVERAGE AGE
          </span>
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-slate-300">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {stats.avgAge > 0 ? `${stats.avgAge} yrs` : 'N/A'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Attendee age demographic</p>
      </div>

      {/* Card 4: End-User Digital Pass & Security Status */}
      <div 
        onClick={onOpenLookup}
        className="group p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-emerald-600/40 shadow-sm transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            DIGITAL PASS STATUS
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Instant Issue
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
          <span>QR Pass &amp; 256-bit Encrypted</span>
          <span className="text-emerald-300 text-[10px] font-semibold group-hover:underline">Lookup &rarr;</span>
        </p>
      </div>
    </div>
  );
};




