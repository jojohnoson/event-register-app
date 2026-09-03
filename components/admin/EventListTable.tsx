'use client';

import React, { useState, useMemo } from 'react';
import { Event } from '@/types';
import {
  Edit2,
  ExternalLink,
  Archive,
  Calendar,
  Users,
  Search,
  Filter,
  X,
  Sparkles,
  UserCheck,
  ShieldAlert,
  BarChart2,
  Trash2,
  List,
  LayoutGrid,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { DoubleDeleteModal } from '@/components/DoubleDeleteModal';

interface EventListTableProps {
  events: Event[];
  adminToken: string;
  onRefresh: () => void;
  onEdit: (event: Event) => void;
  onSelectEventForAttendees?: (eventId: number) => void;
}

export const EventListTable: React.FC<EventListTableProps> = ({
  events,
  adminToken,
  onRefresh,
  onEdit,
  onSelectEventForAttendees,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft' | 'archived'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Double delete event state
  const [deleteEventTarget, setDeleteEventTarget] = useState<Event | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchQuery]);

  const handleConfirmArchive = async (ids: number[]) => {
    const id = ids[0];
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        onRefresh();
        setDeleteEventTarget(null);
      }
    } catch (e) {
      console.error('Error archiving event:', e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Event Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or slug..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
            {(['ALL', 'published', 'draft', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-amber-500 text-stone-900 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'All Events' : status}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                viewMode === 'table' ? 'bg-amber-500 text-stone-900 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-amber-500 text-stone-900 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
          <p className="text-slate-300 text-sm">No events found matching your criteria.</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or create a new event.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[10px] text-slate-400 border-b border-white/10 font-bold">
                <tr>
                  <th className="px-6 py-4">Event &amp; Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Live Registrations &amp; Capacity</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.map((event) => {
                  const startDate = new Date(event.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  const count = event.registration_count || 0;
                  const max = event.max_capacity || 0;
                  const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

                  return (
                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
                      {/* Event Title & Slug */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-white text-sm block">
                            {event.title}
                          </span>
                          <span className="font-mono text-amber-400 text-[11px]">
                            /events/{event.slug}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            event.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : event.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {startDate}
                        </span>
                      </td>

                      {/* Live Registrations & Capacity Progress Bar */}
                      <td className="px-6 py-4 min-w-[220px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              {count} registered
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {max > 0 ? `${percent}% of ${max}` : 'Unlimited'}
                            </span>
                          </div>

                          {max > 0 && (
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  percent >= 90
                                    ? 'bg-rose-500'
                                    : percent >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Public Page */}
                          <a
                            href={`/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* View Attendees / Analytics */}
                          {onSelectEventForAttendees && (
                            <button
                              onClick={() => onSelectEventForAttendees(event.id)}
                              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition cursor-pointer"
                              title="Manage Event Attendees"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Event */}
                          <button
                            onClick={() => onEdit(event)}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
                            title="Edit Event Settings"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Permanent Delete Event (Double-Verified) */}
                          <button
                            onClick={() => setDeleteEventTarget(event)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                            title="Delete Event Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const count = event.registration_count || 0;
            const max = event.max_capacity || 0;
            const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

            return (
              <div
                key={event.id}
                className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        event.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : event.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {startDate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white line-clamp-1">{event.title}</h4>
                    <span className="font-mono text-amber-400 text-xs">/events/{event.slug}</span>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{event.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {count} Registered
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {max > 0 ? `${percent}% of ${max}` : 'Unlimited'}
                      </span>
                    </div>
                    {max > 0 && (
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => onSelectEventForAttendees && onSelectEventForAttendees(event.id)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Attendees</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={`/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                        title="Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onEdit(event)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteEventTarget(event)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Double-Verified Permanent Delete Modal for Events */}
      {deleteEventTarget && (
        <DoubleDeleteModal
          isOpen={!!deleteEventTarget}
          onClose={() => setDeleteEventTarget(null)}
          onConfirmDelete={handleConfirmArchive}
          title="Permanent Summit Deletion"
          description="This action will permanently delete this event and all associated attendee registrations from the database. It will immediately disappear from both the admin dashboard and the live website."
          entityType="event"
          targetAttendees={[
            {
              id: deleteEventTarget.id,
              name: deleteEventTarget.title,
              email: `/events/${deleteEventTarget.slug}`,
              attendee_id: `EVENT-${deleteEventTarget.id}`,
            },
          ]}
          isBulk={false}
        />
      )}
    </div>
  );
};