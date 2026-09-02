'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { AdminPortal } from '@/components/AdminPortal';
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
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'legacy'>('events');

  // Sub-tab inside Multi-Event Platform
  const [multiEventSubTab, setMultiEventSubTab] = useState<'events_list' | 'attendees_directory'>('events_list');
  const [selectedEventForDirectory, setSelectedEventForDirectory] = useState<number | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Restore token
  useEffect(() => {
    try {
      const saved = localStorage.getItem('registerhub_admin_token');
      if (saved) {
        setAdminToken(saved);
      } else {
        setIsLoginModalOpen(true);
      }
    } catch {}
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchEvents();
    }
  }, [adminToken, fetchEvents]);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      localStorage.setItem('registerhub_admin_token', token);
    } catch {}
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setAdminToken(null);
    try {
      localStorage.removeItem('registerhub_admin_token');
    } catch {}
    setIsLoginModalOpen(true);
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
    setMultiEventSubTab('attendees_directory');
  };

  const totalRegistrations = events.reduce((acc, e) => acc + (e.registration_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 p-4 sm:p-8 lg:p-12 relative">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Platform Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Full Control
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage dynamic multi-event registrations, custom form builders, and attendee credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition"
            >
              Public Events Portal &rarr;
            </a>

            {adminToken && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (Multi-Event vs Legacy) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-stone-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Multi-Event Platform ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('legacy')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'legacy'
                  ? 'bg-amber-500 text-stone-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Legacy Single Event Records</span>
            </button>
          </div>

          {activeTab === 'events' && (
            <div className="flex items-center gap-2">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                title="Refresh events"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Event Sub-Tabs: Events Overview vs Attendee Directory */}
        {activeTab === 'events' && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setMultiEventSubTab('events_list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                multiEventSubTab === 'events_list'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Events ({events.length})</span>
            </button>

            <button
              onClick={() => setMultiEventSubTab('attendees_directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                multiEventSubTab === 'attendees_directory'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Attendee Directory &amp; Access Control</span>
              {totalRegistrations > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-stone-900 font-extrabold">
                  {totalRegistrations}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'events' ? (
          <div className="space-y-6">
            {multiEventSubTab === 'events_list' ? (
              <EventListTable
                events={events}
                adminToken={adminToken || ''}
                onRefresh={fetchEvents}
                onEdit={handleOpenEdit}
                onSelectEventForAttendees={handleSelectEventForAttendees}
              />
            ) : (
              <EventAttendeesDirectory
                adminToken={adminToken || ''}
                selectedEventId={selectedEventForDirectory}
                onRefreshEvents={fetchEvents}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <AdminPortal
              adminToken={adminToken || ''}
              onLogout={handleLogout}
              onSwitchToUserMode={() => {}}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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