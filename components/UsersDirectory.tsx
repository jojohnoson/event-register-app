'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  Check,
  Copy,
  Clock,
  UserCheck
} from 'lucide-react';
import { Registration } from '@/types';

interface UsersDirectoryProps {
  users: Registration[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteUser: (id: number) => Promise<void>;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const UsersDirectory: React.FC<UsersDirectoryProps> = ({
  users,
  loading,
  onRefresh,
  onDeleteUser,
  isOpenModal = false,
  onCloseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredUsers.length === 0) return;

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Age', 'Organization', 'Role', 'Notes', 'Registration Date'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      u.age,
      `"${(u.organization || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(u.created_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registered_attendees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the database?`)) {
      setDeletingId(id);
      try {
        await onDeleteUser(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const content = (
    <div className="w-full space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Registered Attendees
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete list of all users registered in the attendee database.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          {isOpenModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone, organization, or role..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* User Content */}
      {loading && users.length === 0 ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm">Loading attendee records...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-white">No Attendees Found</h4>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
            {searchQuery
              ? `No registrations match your search "${searchQuery}". Try a different keyword.`
              : 'No attendees have registered yet. Be the first to register using the form above!'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Attendee</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Age</th>
                <th className="py-3.5 px-4">Organization & Role</th>
                <th className="py-3.5 px-4">Registered At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    {u.notes && (
                      <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5" title={u.notes}>
                        &ldquo;{u.notes}&rdquo;
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{u.email}</span>
                      <button
                        onClick={() => handleCopy(u.email, `email-${u.id}`)}
                        className="text-slate-500 hover:text-slate-300 ml-1"
                        title="Copy email"
                      >
                        {copiedField === `email-${u.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{u.phone}</span>
                      <button
                        onClick={() => handleCopy(u.phone, `phone-${u.id}`)}
                        className="text-slate-500 hover:text-slate-300 ml-1"
                        title="Copy phone"
                      >
                        {copiedField === `phone-${u.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs">
                      {u.age} yrs
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">
                      {u.organization || <span className="text-slate-500 italic">Individual</span>}
                    </div>
                    {u.role && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{u.role}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(u.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="relative p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with avatar & name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base leading-tight">{u.name}</h4>
                      <span className="text-xs text-indigo-400 font-medium">Age {u.age}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    disabled={deletingId === u.id}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition"
                    title="Delete registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(u.email, `grid-email-${u.id}`)}
                      className="text-slate-400 hover:text-white"
                      title="Copy email"
                    >
                      {copiedField === `grid-email-${u.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{u.phone}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(u.phone, `grid-phone-${u.id}`)}
                      className="text-slate-400 hover:text-white"
                      title="Copy phone"
                    >
                      {copiedField === `grid-phone-${u.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {u.organization && (
                    <div className="flex items-center gap-2 pt-1 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300 font-medium">{u.organization}</span>
                      {u.role && <span className="text-slate-500">• {u.role}</span>}
                    </div>
                  )}

                  {u.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-slate-400 text-xs italic">
                      &ldquo;{u.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Registered</span>
                <span>{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div id="directory-section" className="w-full">
      <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        {content}
      </div>
    </div>
  );
};



