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
  ShieldAlert
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 text-xs self-start sm:self-auto">
          {(['ALL', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition ${
                statusFilter === status
                  ? 'bg-amber-500 text-stone-900 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Events' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
          <p className="text-slate-300 text-sm">No events found matching your criteria.</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or create a new event.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[10px] text-slate-400 border-b border-white/10 font-bold">
                <tr>
                  <th className="px-6 py-4">Event &amp; Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEvents.map((event) => {
                  const startDate = new Date(event.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
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

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {startDate}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {onSelectEventForAttendees ? (
                          <button
                            onClick={() => onSelectEventForAttendees(event.id)}
                            className="font-bold text-white hover:text-amber-400 flex items-center gap-1.5 group transition"
                            title="Click to view & manage attendees for this event"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>{event.registration_count || 0} attendees</span>
                            <span className="text-[10px] text-amber-400 font-normal underline ml-1">
                              Manage &rarr;
                            </span>
                          </button>
                        ) : (
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            {event.registration_count || 0} attendees
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-400">
                          {event.max_capacity > 0 ? `${event.max_capacity} max` : 'Unlimited'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View public page */}
                          <a
                            href={`/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                            title="View Public Event Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Edit event */}
                          <button
                            onClick={() => onEdit(event)}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition"
                            title="Edit Event Configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Double-verified Archive */}
                          {event.status !== 'archived' && (
                            <button
                              onClick={() => setDeleteEventTarget(event)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Archive Event (Double-Verified)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Double-Verified Archive Modal for Events */}
      {deleteEventTarget && (
        <DoubleDeleteModal
          isOpen={!!deleteEventTarget}
          onClose={() => setDeleteEventTarget(null)}
          onConfirmDelete={handleConfirmArchive}
          targetAttendees={[
            {
              id: deleteEventTarget.id,
              name: deleteEventTarget.title,
              email: `Slug: /events/${deleteEventTarget.slug}`,
              attendee_id: `EVENT-${deleteEventTarget.id}`,
            },
          ]}
          isBulk={false}
        />
      )}
    </div>
  );
};