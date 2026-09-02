'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EventRegistration, Event } from '@/types';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  List,
  LayoutGrid,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Copy,
  Check,
  QrCode,
  Edit2,
  X,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Calendar,
  Tag,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { DoubleDeleteModal, DeletableAttendee } from '@/components/DoubleDeleteModal';

interface EventAttendeesDirectoryProps {
  adminToken: string;
  selectedEventId?: number | null;
  onRefreshEvents?: () => void;
}

export const EventAttendeesDirectory: React.FC<EventAttendeesDirectoryProps> = ({
  adminToken,
  selectedEventId = null,
  onRefreshEvents,
}) => {
  const [attendees, setAttendees] = useState<EventRegistration[]>([]);
  const [eventsList, setEventsList] = useState<Array<{ id: number; title: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>(
    selectedEventId ? String(selectedEventId) : 'ALL'
  );
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');
  const [selectedCheckinFilter, setSelectedCheckinFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Multi-Select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Copy Feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Double-Delete Modal State
  const [isDoubleDeleteOpen, setIsDoubleDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<DeletableAttendee[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // View QR Pass Modal State
  const [viewingPassAttendee, setViewingPassAttendee] = useState<EventRegistration | null>(null);

  // Edit Attendee Modal State
  const [editingAttendee, setEditingAttendee] = useState<EventRegistration | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    organization: '',
    role: '',
    notes: '',
  });

  // Update event filter if prop changes
  useEffect(() => {
    if (selectedEventId) {
      setSelectedEventFilter(String(selectedEventId));
    }
  }, [selectedEventId]);

  // Fetch attendees from API
  const fetchAttendees = useCallback(async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEventFilter !== 'ALL') {
        params.set('event_id', selectedEventFilter);
      }
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }
      if (selectedOrgFilter !== 'ALL') {
        params.set('org', selectedOrgFilter);
      }
      if (selectedCheckinFilter !== 'ALL') {
        params.set('checkin', selectedCheckinFilter);
      }

      const res = await fetch(`/api/admin/attendees?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.attendees) {
        setAttendees(data.attendees);
      }
      if (data.events) {
        setEventsList(data.events);
      }
    } catch (e) {
      console.error('Error fetching event attendees:', e);
    } finally {
      setLoading(false);
    }
  }, [adminToken, selectedEventFilter, searchQuery, selectedOrgFilter, selectedCheckinFilter]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  // Extract unique organizations
  const uniqueOrganizations = useMemo(() => {
    const orgs = new Set<string>();
    attendees.forEach((a) => {
      if (a.organization && a.organization.trim()) {
        orgs.add(a.organization.trim());
      }
    });
    return Array.from(orgs).sort();
  }, [attendees]);

  // Multi-select helpers
  const handleSelectAll = () => {
    if (selectedIds.size === attendees.length && attendees.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(attendees.map((a) => a.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Toggle Check-in status
  const handleToggleCheckin = async (attendee: EventRegistration) => {
    const newStatus = !attendee.checked_in;
    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          id: attendee.id,
          checked_in: newStatus,
        }),
      });
      if (res.ok) {
        setAttendees((prev) =>
          prev.map((a) => (a.id === attendee.id ? { ...a, checked_in: newStatus } : a))
        );
      }
    } catch (e) {
      console.error('Error toggling checkin:', e);
    }
  };

  // Bulk check-in
  const handleBulkCheckin = async (checkedIn: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: checkedIn ? 'checkin' : 'uncheckin',
          ids: Array.from(selectedIds),
        }),
      });
      if (res.ok) {
        setAttendees((prev) =>
          prev.map((a) => (selectedIds.has(a.id) ? { ...a, checked_in: checkedIn } : a))
        );
        setSelectedIds(new Set());
      }
    } catch (e) {
      console.error('Error bulk checkin:', e);
    }
  };

  // Initiate single delete
  const handleInitiateSingleDelete = (attendee: EventRegistration) => {
    setDeleteTargets([
      {
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        attendee_id: attendee.attendee_id,
        organization: attendee.organization,
        role: attendee.role,
      },
    ]);
    setIsBulkDelete(false);
    setIsDoubleDeleteOpen(true);
  };

  // Initiate bulk delete
  const handleInitiateBulkDelete = () => {
    const targets = attendees
      .filter((a) => selectedIds.has(a.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        attendee_id: a.attendee_id,
        organization: a.organization,
        role: a.role,
      }));
    if (targets.length === 0) return;
    setDeleteTargets(targets);
    setIsBulkDelete(true);
    setIsDoubleDeleteOpen(true);
  };

  // Confirm delete handler called by DoubleDeleteModal
  const handleConfirmDoubleDelete = async (ids: number[]) => {
    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setAttendees((prev) => prev.filter((a) => !ids.includes(a.id)));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        if (onRefreshEvents) onRefreshEvents();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete attendee records');
      }
    } catch (e: any) {
      console.error('Double delete error:', e);
      throw e;
    }
  };

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Export CSV
  const exportToCSV = () => {
    if (attendees.length === 0) return;
    const headers = [
      'Attendee ID',
      'Event',
      'Full Name',
      'Email',
      'Phone',
      'Age',
      'Organization',
      'Role',
      'Check-in Status',
      'Dietary',
      'T-Shirt Size',
      'Notes',
      'Registered At',
    ];
    const rows = attendees.map((a) => [
      `"${a.attendee_id || ''}"`,
      `"${(a.event_title || '').replace(/"/g, '""')}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      a.age || '',
      `"${(a.organization || '').replace(/"/g, '""')}"`,
      `"${(a.role || '').replace(/"/g, '""')}"`,
      a.checked_in ? 'Checked In' : 'Pending',
      `"${(a.dietary || '').replace(/"/g, '""')}"`,
      `"${(a.tshirt_size || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(a.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `event_attendees_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit attendee save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    try {
      const res = await fetch('/api/admin/attendees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          id: editingAttendee.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          age: editForm.age ? parseInt(editForm.age, 10) : null,
          organization: editForm.organization,
          role: editForm.role,
          notes: editForm.notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAttendees((prev) =>
          prev.map((a) => (a.id === editingAttendee.id ? { ...a, ...data.attendee } : a))
        );
        setEditingAttendee(null);
      }
    } catch (e) {
      console.error('Error saving attendee edit:', e);
    }
  };

  const openEditModal = (a: EventRegistration) => {
    setEditingAttendee(a);
    setEditForm({
      name: a.name || '',
      email: a.email || '',
      phone: a.phone || '',
      age: a.age ? String(a.age) : '',
      organization: a.organization || '',
      role: a.role || '',
      notes: a.notes || '',
    });
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Attendee Directory &amp; Access Control</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              {attendees.length} shown
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter by multi-event, verify check-in status, or perform double-verified deletions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Event Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Events</option>
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-slate-900 text-white">
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Org Filter */}
          {uniqueOrganizations.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedOrgFilter}
                onChange={(e) => setSelectedOrgFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Organizations</option>
                {uniqueOrganizations.map((org) => (
                  <option key={org} value={org} className="bg-slate-900 text-white">{org}</option>
                ))}
              </select>
            </div>
          )}

          {/* Check-in Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedCheckinFilter}
              onChange={(e) => setSelectedCheckinFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Check-in States</option>
              <option value="CHECKED_IN" className="bg-slate-900 text-white">Checked In Only</option>
              <option value="PENDING" className="bg-slate-900 text-white">Pending Check-in</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAttendees}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-amber-500 text-stone-900 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'grid' ? 'bg-amber-500 text-stone-900 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={attendees.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold shadow-md transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Bulk Actions Bar (Image 2 style) */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, organization, role, tier, or attendee ID..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bulk Actions Banner if items are selected */}
        {selectedIds.size > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>
                <strong>{selectedIds.size}</strong> attendee(s) selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkCheckin(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
              >
                Mark Checked-In
              </button>
              <button
                onClick={() => handleBulkCheckin(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition"
              >
                Unmark Checked-In
              </button>
              <button
                onClick={handleInitiateBulkDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected (Double-Verified)</span>
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-400 hover:text-white px-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Directory Table or Grid */}
      {attendees.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950/40 border border-white/5 text-center space-y-3">
          <UserX className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">No registered attendees match your filter.</p>
          <p className="text-xs text-slate-500">
            Try resetting your search query or choosing another event from the dropdown filter.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl bg-slate-950/40 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[10px] text-slate-400 border-b border-white/10 font-bold">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-white focus:outline-none"
                    >
                      {selectedIds.size > 0 && selectedIds.size === attendees.length ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3.5 font-bold"># ID</th>
                  <th className="px-5 py-3.5 font-bold">Attendee</th>
                  <th className="px-4 py-3.5 font-bold">Event &amp; Pass</th>
                  <th className="px-4 py-3.5 font-bold">Check-in Status</th>
                  <th className="px-5 py-3.5 font-bold">Contact Info</th>
                  <th className="px-3 py-3.5 font-bold">Age</th>
                  <th className="px-4 py-3.5 font-bold">Organization &amp; Role</th>
                  <th className="px-4 py-3.5 text-right font-bold">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendees.map((attendee) => {
                  const isSelected = selectedIds.has(attendee.id);
                  const isCheckedIn = attendee.checked_in;

                  return (
                    <tr
                      key={attendee.id}
                      className={`hover:bg-white/5 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(attendee.id)}
                          className="text-slate-400 hover:text-white focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Attendee ID */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                          {attendee.attendee_id || `#${attendee.id}`}
                        </span>
                      </td>

                      {/* Name + Notes */}
                      <td className="px-5 py-3.5">
                        <div>
                          <span className="font-bold text-white text-sm block">
                            {attendee.name}
                          </span>
                          {attendee.notes && (
                            <span className="text-slate-400 text-[11px] italic line-clamp-1">
                              &ldquo;{attendee.notes}&rdquo;
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Event Title & Early Bird Badge */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-200 block text-xs truncate max-w-[140px]">
                            {attendee.event_title || 'General Event'}
                          </span>
                          {attendee.is_early_bird && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Sparkles className="w-2.5 h-2.5" /> Early Bird
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Check-in Status Pill (Interactive) */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleCheckin(attendee)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                            isCheckedIn
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                          title="Click to toggle check-in status"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                            }`}
                          />
                          <span>{isCheckedIn ? 'Checked In' : 'Pending'}</span>
                        </button>
                      </td>

                      {/* Contact Info (with copy buttons) */}
                      <td className="px-5 py-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[160px] font-mono">{attendee.email}</span>
                          <button
                            onClick={() => handleCopy(attendee.email, `email-${attendee.id}`)}
                            className="p-1 text-slate-500 hover:text-white transition"
                            title="Copy Email"
                          >
                            {copiedField === `email-${attendee.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="font-mono">{attendee.phone}</span>
                            <button
                              onClick={() => handleCopy(attendee.phone || '', `phone-${attendee.id}`)}
                              className="p-1 text-slate-500 hover:text-white transition"
                              title="Copy Phone"
                            >
                              {copiedField === `phone-${attendee.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Age */}
                      <td className="px-3 py-3.5 font-mono text-slate-300">
                        {attendee.age ? `${attendee.age} yrs` : '-'}
                      </td>

                      {/* Organization & Role */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block truncate max-w-[150px]">
                            {attendee.organization || 'Independent'}
                          </span>
                          {attendee.role && (
                            <span className="text-slate-400 flex items-center gap-1 text-[11px] truncate max-w-[150px]">
                              <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                              {attendee.role}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Admin Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Digital Pass / QR */}
                          <button
                            onClick={() => setViewingPassAttendee(attendee)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                            title="View Digital QR Pass"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(attendee)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition"
                            title="Edit Attendee Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Double-Verified Delete */}
                          <button
                            onClick={() => handleInitiateSingleDelete(attendee)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Double-Verified Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendees.map((attendee) => (
            <div
              key={attendee.id}
              className="p-5 rounded-2xl bg-slate-950/40 border border-white/10 hover:border-amber-500/30 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">
                  {attendee.attendee_id || `#${attendee.id}`}
                </span>
                <button
                  onClick={() => handleToggleCheckin(attendee)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    attendee.checked_in
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  {attendee.checked_in ? 'Checked In' : 'Pending'}
                </button>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">{attendee.name}</h4>
                <p className="text-xs text-slate-400">{attendee.email}</p>
                {attendee.phone && <p className="text-xs text-slate-500 font-mono">{attendee.phone}</p>}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{attendee.organization || 'Independent'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingPassAttendee(attendee)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400"
                    title="View QR Pass"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(attendee)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInitiateSingleDelete(attendee)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Double Delete Modal (2-Step Verified) */}
      <DoubleDeleteModal
        isOpen={isDoubleDeleteOpen}
        onClose={() => setIsDoubleDeleteOpen(false)}
        onConfirmDelete={handleConfirmDoubleDelete}
        targetAttendees={deleteTargets}
        isBulk={isBulkDelete}
      />

      {/* View Digital Pass Modal */}
      {viewingPassAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setViewingPassAttendee(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Official Attendee Pass
              </span>
              <h3 className="text-lg font-black text-white">{viewingPassAttendee.name}</h3>
              <p className="text-xs text-slate-400">{viewingPassAttendee.event_title}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 flex flex-col items-center justify-center space-y-3">
              <img
                src={`/api/registrations/qr?attendee_id=${viewingPassAttendee.attendee_id}`}
                alt="QR Pass"
                className="w-48 h-48 rounded-xl bg-slate-900 p-2 border border-white/10"
              />
              <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
                {viewingPassAttendee.attendee_id}
              </span>
            </div>

            <div className="text-center">
              <button
                onClick={() => setViewingPassAttendee(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold"
              >
                Close Pass View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendee Modal */}
      {editingAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setEditingAttendee(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white">Edit Attendee Record</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Organization</label>
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAttendee(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
