'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Event } from '@/types';
import { EventCreatorModal } from '@/components/admin/EventCreatorModal';
import { EventListTable } from '@/components/admin/EventListTable';
import { EventAttendeesDirectory } from '@/components/admin/EventAttendeesDirectory';
import {
  Plus,
  Sparkles,
  LogOut,
  ShieldCheck,
  Calendar,
  Users,
  RefreshCw,
  UserCheck,
  Layers,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Home,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login form state
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  // Unified Main Tabs: 1 = All Events, 2 = Attendee Directory
  const [activeTab, setActiveTab] = useState<'events' | 'attendees'>('events');
  const [selectedEventForDirectory, setSelectedEventForDirectory] = useState<number | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Verify active session on mount
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('registerhub_admin_token') || localStorage.getItem('registerhub_admin_token');
      if (savedToken) {
        setAdminToken(savedToken);
      }
    } catch {}
    setIsCheckingAuth(false);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!adminToken) return;
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error('Error loading events:', e);
    } finally {
      setLoadingEvents(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchEvents();
    }
  }, [adminToken, fetchEvents]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword.trim()) {
      setLoginError('Please enter the administrator password.');
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError(null);

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Incorrect admin key.');
      }

      if (data.token) {
        setAdminToken(data.token);
        try {
          sessionStorage.setItem('registerhub_admin_token', data.token);
          localStorage.setItem('registerhub_admin_token', data.token);
        } catch {}
        setLoginPassword('');
        setLoggedOutNotice(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAdminToken(null);
    setEvents([]);
    try {
      sessionStorage.removeItem('registerhub_admin_token');
      localStorage.removeItem('registerhub_admin_token');
    } catch {}
    setLoggedOutNotice(true);
    setLoginPassword('');
    setLoginError(null);
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsCreatorOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setIsCreatorOpen(true);
  };

  const handleSelectEventForAttendees = (eventId: number) => {
    setSelectedEventForDirectory(eventId);
    setActiveTab('attendees');
  };

  const totalRegistrations = events.reduce((acc, e) => acc + (e.registration_count || 0), 0);

  // Loading state while verifying stored session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // ==========================================
  // VIEW 1: SECURE ADMIN LOGIN SCREEN (GATE)
  // ==========================================
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col justify-between relative selection:bg-amber-500/30 selection:text-white">
        {/* Ambient lighting */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Minimal Header with Prominent Back to Home Page Button */}
        <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 group cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>&larr; Back to Home Page</span>
          </Link>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Staff Portal Security</span>
          </div>
        </header>

        {/* Centered Login Card */}
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
                <Lock className="w-7 h-7 text-stone-950" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Admin Platform Login
                </h1>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Enter your administrator credentials to manage multi-event registrations, custom form builders, and attendee directories.
                </p>
              </div>
            </div>

            {loggedOutNotice && (
              <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You have been securely logged out.</span>
              </div>
            )}

            {loginError && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Administrator Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    autoFocus
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-white/10 text-center">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-bold transition-all duration-200 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                  <span>Return to Home Page</span>
                </Link>
              </div>
            </form>
          </div>
        </main>

        <footer className="p-6 text-center text-[11px] text-slate-500 relative z-10">
          RegisterHub &copy; 2026 &bull; Protected by 256-Bit Cryptographic Authentication
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNIFIED ADMIN PLATFORM DASHBOARD
  // Single, polished top navigation bar + 2 main tabs
  // ==========================================
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 p-4 sm:p-8 lg:p-12 relative selection:bg-amber-500/30 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* SINGLE CONSOLIDATED TOP NAVIGATION BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Platform Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  Full Privileges
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">Live System &bull; Neon DB Connected</span>
                </span>
                <span>&bull;</span>
                <span>Unified Multi-Event Management Architecture</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Public Events Portal &rarr;
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition cursor-pointer"
              title="End admin session and log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* UNIFIED 2-TAB ARCHITECTURE CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-stone-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>All Events ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('attendees')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'attendees'
                  ? 'bg-amber-500 text-stone-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Attendee Directory &amp; Access Control</span>
              {totalRegistrations > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-900/40 text-stone-900 font-black">
                  {totalRegistrations}
                </span>
              )}
            </button>
          </div>

          {/* Global Event Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              disabled={loadingEvents}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title="Refresh events from database"
            >
              <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* UNIFIED TAB CONTENT */}
        <div className="space-y-6">
          {activeTab === 'events' ? (
            /* TAB 1: ALL EVENTS (EVENT MANAGER) */
            <EventListTable
              events={events}
              adminToken={adminToken}
              onRefresh={fetchEvents}
              onEdit={handleOpenEdit}
              onSelectEventForAttendees={handleSelectEventForAttendees}
            />
          ) : (
            /* TAB 2: ATTENDEE DIRECTORY & ACCESS CONTROL */
            <EventAttendeesDirectory
              adminToken={adminToken}
              selectedEventId={selectedEventForDirectory}
              onRefreshEvents={fetchEvents}
              onEventChange={(id) => setSelectedEventForDirectory(id)}
            />
          )}
        </div>
      </div>

      {/* Event Creator/Editor Modal */}
      {isCreatorOpen && adminToken && (
        <EventCreatorModal
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onSaved={fetchEvents}
          editEvent={editingEvent}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}