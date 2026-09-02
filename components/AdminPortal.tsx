'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Download,
  Trash2,
  Edit,
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
  ShieldCheck,
  UserCheck,
  LogOut,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Filter,
  Save,
  ArrowRight,
  ShieldAlert,
  Tag,
  CheckSquare,
  Square,
  History,
  Activity,
  UserCheck2,
  UserX,
  Sparkles
} from 'lucide-react';
import { Registration } from '@/types';
import { DoubleDeleteModal } from '@/components/DoubleDeleteModal';

interface AdminPortalProps {
  adminToken: string;
  onLogout: () => void;
  onSwitchToUserMode: () => void;
}

interface AdminStats {
  total: number;
  organizations: number;
  avgAge: number;
  minAge?: number;
  maxAge?: number;
  checkedInCount?: number;
  topOrganizations?: { org_name: string; member_count: number }[];
  tierBreakdown?: { tier_name: string; count: number }[];
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'DELETE' | 'UPDATE' | 'CHECKIN' | 'EXPORT' | 'LOGIN';
  details: string;
  badge?: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminToken,
  onLogout,
  onSwitchToUserMode,
}) => {
  const [users, setUsers] = useState<Registration[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    organizations: 0,
    avgAge: 0,
    checkedInCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [selectedCheckinFilter, setSelectedCheckinFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState<'directory' | 'audit'>('directory');
  
  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Double verification delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attendeesToDelete, setAttendeesToDelete] = useState<Registration[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Edit modal
  const [editingUser, setEditingUser] = useState<Registration | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audit activity logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      action: 'LOGIN',
      details: 'Admin authenticated with full privileges.',
      badge: 'AUTH',
    },
  ]);

  const addAuditLog = (action: AuditLogEntry['action'], details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
      badge: action,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all registered users
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        showToast('Admin session expired. Please log in again.');
        onLogout();
        return;
      }

      if (!res.ok) throw new Error('Failed to load admin attendee list');

      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, organizations: 0, avgAge: 0, checkedInCount: 0 });
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      showToast(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [adminToken, onLogout]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Unique org list for filter dropdown
  const uniqueOrganizations = useMemo(() => {
    const orgs = new Set<string>();
    users.forEach((u) => {
      if (u.organization && u.organization.trim()) {
        orgs.add(u.organization.trim());
      }
    });
    return Array.from(orgs).sort();
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Org filter
      if (selectedOrgFilter !== 'ALL') {
        const uOrg = u.organization || 'Individual';
        if (uOrg !== selectedOrgFilter) return false;
      }

      // Tier filter
      if (selectedTierFilter !== 'ALL') {
        const uTier = u.ticket_type || 'General Access';
        if (uTier !== selectedTierFilter) return false;
      }

      // Check-in filter
      if (selectedCheckinFilter === 'CHECKED_IN' && !u.checked_in) return false;
      if (selectedCheckinFilter === 'PENDING' && u.checked_in) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.ticket_type && u.ticket_type.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q)) ||
        u.id.toString().includes(q)
      );
    });
  }, [users, searchQuery, selectedOrgFilter, selectedTierFilter, selectedCheckinFilter]);

  // Multi-select toggle
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredUsers.length === 0) return;

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Age', 'Tier', 'Checked In', 'Organization', 'Role', 'Notes', 'Registration Date'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      u.age,
      `"${(u.ticket_type || 'General Access').replace(/"/g, '""')}"`,
      u.checked_in ? 'YES' : 'NO',
      `"${(u.organization || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(u.created_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registerhub_attendees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('EXPORT', `Exported CSV of ${filteredUsers.length} attendee records.`);
    showToast(`Exported ${filteredUsers.length} attendees to CSV!`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Toggle Check-in status
  const handleToggleCheckin = async (user: Registration) => {
    const newStatus = !user.checked_in;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          id: user.id,
          checked_in: newStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update check-in status');
      const data = await res.json();

      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
      setStats((prev) => ({
        ...prev,
        checkedInCount: Math.max(0, (prev.checkedInCount || 0) + (newStatus ? 1 : -1)),
      }));

      addAuditLog('CHECKIN', `${newStatus ? 'Checked in' : 'Unmarked check-in for'} ${user.name} (#${user.id})`);
      showToast(`${user.name} is now marked as ${newStatus ? 'CHECKED IN' : 'PENDING'}`);
    } catch (err: any) {
      showToast(err.message || 'Error updating check-in');
    }
  };

  // Bulk check-in
  const handleBulkCheckin = async (status: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch('/api/admin/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ id, checked_in: status }),
        })
      );
      await Promise.all(promises);
      showToast(`Updated check-in status for ${selectedIds.size} attendees.`);
      addAuditLog('CHECKIN', `Bulk ${status ? 'checked in' : 'unmarked'} ${selectedIds.size} attendees.`);
      setSelectedIds(new Set());
      fetchAdminData();
    } catch (err: any) {
      showToast('Error performing bulk check-in.');
    }
  };

  // Initiate single delete with double verification
  const handleInitiateDelete = (user: Registration) => {
    setAttendeesToDelete([user]);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  };

  // Initiate bulk delete with double verification
  const handleInitiateBulkDelete = () => {
    const toDelete = users.filter((u) => selectedIds.has(u.id));
    if (toDelete.length === 0) return;
    setAttendeesToDelete(toDelete);
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };

  // Final confirmed deletion from DoubleDeleteModal
  const handleConfirmDelete = async (ids: number[]) => {
    try {
      const deletePromises = ids.map((id) =>
        fetch(`/api/admin/users?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        })
      );

      const results = await Promise.all(deletePromises);
      const allOk = results.every((r) => r.ok);

      if (!allOk) {
        throw new Error('Some records could not be deleted.');
      }

      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });

      const deletedNames = attendeesToDelete.map((u) => u.name).join(', ');
      addAuditLog('DELETE', `Permanently deleted ${ids.length} record(s): ${deletedNames}`);
      showToast(`Successfully purged ${ids.length} attendee record(s).`);
      fetchAdminData();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete records.');
    }
  };

  // Save edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingEdit(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update attendee');

      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data.user : u)));
      addAuditLog('UPDATE', `Updated registration for "${data.user.name}" (#${data.user.id})`);
      showToast(`Updated attendee "${data.user.name}" successfully!`);
      setEditingUser(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save edits');
    } finally {
      setSavingEdit(false);
    }
  };

  const getTierColor = (tier?: string | null) => {
    switch (tier) {
      case 'VIP All-Access': return 'bg-amber-500/20 text-amber-950 border-amber-500/30';
      case 'Speaker / Presenter': return 'bg-orange-100 text-orange-950 border-orange-300';
      case 'Student / Innovator': return 'bg-white/10 text-white border-white/20';
      default: return 'bg-white/10 text-slate-200 border-white/20';
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm shadow-xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation & Status Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 flex items-center justify-center text-amber-100 shadow-md shadow-amber-900/15">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Management Portal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Full Privileges
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Secure administrative access to all attendee registrations, double-verified deletion &amp; live check-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab buttons */}
          <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/20">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'directory' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'audit' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>
          </div>

          <button
            onClick={onSwitchToUserMode}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/15 transition"
          >
            Public View
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">{stats.total}</div>
          <p className="mt-1 text-xs text-slate-400">Live attendee records</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Checked-In Attendees</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.checkedInCount || 0}</span>
            <span className="text-xs text-slate-400">
              ({stats.total > 0 ? Math.round(((stats.checkedInCount || 0) / stats.total) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Verified at venue entrance</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-slate-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">{stats.organizations}</div>
          <p className="mt-1 text-xs text-slate-400">Unique corporate/academic entities</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Age</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-950 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">{stats.avgAge > 0 ? `${stats.avgAge} yrs` : 'N/A'}</div>
          <p className="mt-1 text-xs text-slate-400">
            {stats.minAge && stats.maxAge ? `Range: ${stats.minAge} - ${stats.maxAge} yrs` : 'Demographic average'}
          </p>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'audit' ? (
        /* AUDIT ACTIVITY LOG TAB */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-300" />
                <span>Security &amp; Administrative Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Real-time security log recording attendee modifications, double-verified deletions, check-ins, and exports.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('directory')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              &larr; Return to Directory
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    log.action === 'DELETE' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                    log.action === 'CHECKIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    log.action === 'UPDATE' ? 'bg-amber-500/20 text-amber-950 border border-amber-500/30' :
                    'bg-white/10 text-slate-200 border border-white/20'
                  }`}>
                    {log.badge}
                  </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <span className="text-slate-400 font-mono shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DIRECTORY TAB */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Attendee Directory &amp; Access Control</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-normal">
                  {filteredUsers.length} shown
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Search, filter by ticket tier, verify check-in status, or perform double-verified deletions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Org Filter */}
              {uniqueOrganizations.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    value={selectedOrgFilter}
                    onChange={(e) => setSelectedOrgFilter(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Organizations</option>
                    {uniqueOrganizations.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tier Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-xs text-slate-300">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="General Access">General Access</option>
                  <option value="VIP All-Access">VIP All-Access</option>
                  <option value="Speaker / Presenter">Speaker / Presenter</option>
                  <option value="Student / Innovator">Student / Innovator</option>
                </select>
              </div>

              {/* Checkin Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-xs text-slate-300">
                <select
                  value={selectedCheckinFilter}
                  onChange={(e) => setSelectedCheckinFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Check-in States</option>
                  <option value="CHECKED_IN">Checked In Only</option>
                  <option value="PENDING">Pending Check-in</option>
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition disabled:opacity-50"
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'table' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'grid' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Export CSV */}
              <button
                onClick={exportToCSV}
                disabled={filteredUsers.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold shadow-sm transition disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Bulk Actions Bar */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, organization, role, tier, or attendee ID..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
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

            {/* Bulk Actions Banner if items are selected */}
            {selectedIds.size > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs text-amber-950">
                  <CheckSquare className="w-4 h-4 text-amber-300" />
                  <span><strong>{selectedIds.size}</strong> attendee(s) selected</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkCheckin(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow transition"
                  >
                    Mark Checked-In
                  </button>
                  <button
                    onClick={() => handleBulkCheckin(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-stone-200 text-slate-200 text-xs font-semibold border border-white/20 transition"
                  >
                    Unmark Checked-In
                  </button>
                  <button
                    onClick={handleInitiateBulkDelete}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected (Double-Verified)</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-xs text-slate-300 hover:text-white px-2"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content View */}
          {loading && users.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-300 animate-spin" />
              <p className="text-sm">Loading attendee records...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white">No Attendees Found</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                {searchQuery || selectedOrgFilter !== 'ALL' || selectedTierFilter !== 'ALL'
                  ? 'No registrations match your current search or filters.'
                  : 'No attendees have registered yet.'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                  <tr>
                    <th className="py-3.5 px-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-white"
                        title="Select / Deselect all"
                      >
                        {selectedIds.size > 0 && selectedIds.size === filteredUsers.length ? (
                          <CheckSquare className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-3"># ID</th>
                    <th className="py-3.5 px-4">Attendee</th>
                    <th className="py-3.5 px-3">Tier</th>
                    <th className="py-3.5 px-3">Check-in Status</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-3">Age</th>
                    <th className="py-3.5 px-4">Organization &amp; Role</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e2d5]">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedIds.has(u.id);
                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-white/5 transition ${
                          isSelected ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => toggleSelectOne(u.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-300" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-amber-400 font-mono text-xs font-bold whitespace-nowrap">
                          #{u.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{u.name}</div>
                          {u.notes && (
                            <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5" title={u.notes}>
                              &ldquo;{u.notes}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getTierColor(u.ticket_type)}`}>
                            {u.ticket_type || 'General Access'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleCheckin(u)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                              u.checked_in
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-white/10 text-slate-300 border-white/20 hover:border-stone-400 hover:text-white'
                            }`}
                            title="Click to toggle check-in status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.checked_in ? 'bg-emerald-700 animate-pulse' : 'bg-stone-400'}`} />
                            <span>{u.checked_in ? 'Checked In' : 'Pending'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>{u.email}</span>
                            <button
                              onClick={() => handleCopy(u.email, `email-${u.id}`)}
                              className="text-slate-500 hover:text-slate-200 ml-1"
                              title="Copy email"
                            >
                              {copiedField === `email-${u.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{u.phone}</span>
                            <button
                              onClick={() => handleCopy(u.phone, `phone-${u.id}`)}
                              className="text-slate-500 hover:text-slate-200 ml-1"
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
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-semibold">
                            {u.age} yrs
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">
                            {u.organization || <span className="text-slate-500 italic">Individual</span>}
                          </div>
                          {u.role && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{u.role}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser({ ...u })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition"
                              title="Edit attendee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInitiateDelete(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                              title="Delete attendee (Double-Verified)"
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
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => {
                const isSelected = selectedIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className={`relative p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border transition-all flex flex-col justify-between shadow-sm ${
                      isSelected ? 'border-amber-800 bg-amber-50/30' : 'border-white/10 hover:border-amber-700/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSelectOne(u.id)}
                            className="text-slate-500 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-300" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          <div>
                            <h4 className="font-semibold text-white text-base">{u.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-amber-400 font-mono font-bold">#{u.id}</span>
                              <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase border ${getTierColor(u.ticket_type)}`}>
                                {u.ticket_type || 'General'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="text-slate-500 hover:text-amber-400 p-1 rounded-lg hover:bg-white/10 transition"
                            title="Edit attendee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleInitiateDelete(u)}
                            className="text-slate-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                            title="Delete registration (Double-Verified)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-300">
                        {/* Checkin button */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-white/10">
                          <span className="text-[11px] text-slate-400">Venue Check-in:</span>
                          <button
                            onClick={() => handleToggleCheckin(u)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                              u.checked_in
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/10 text-slate-300 border-white/20'
                            }`}
                          >
                            {u.checked_in ? 'Checked In' : 'Pending Check-in'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-white/10">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(u.email, `grid-email-${u.id}`)}
                            className="text-slate-500 hover:text-slate-200"
                          >
                            {copiedField === `grid-email-${u.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-white/10">
                          <div className="flex items-center gap-2 truncate">
                            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{u.phone}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(u.phone, `grid-phone-${u.id}`)}
                            className="text-slate-500 hover:text-slate-200"
                          >
                            {copiedField === `grid-phone-${u.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {u.organization && (
                          <div className="flex items-center gap-2 pt-1 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-white font-medium">{u.organization}</span>
                            {u.role && <span className="text-slate-400">• {u.role}</span>}
                          </div>
                        )}

                        {u.notes && (
                          <div className="p-2.5 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-300 text-xs italic">
                            &ldquo;{u.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Age {u.age} yrs</span>
                      <span>{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DOUBLE VERIFICATION DELETE MODAL */}
      <DoubleDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAttendeesToDelete([]);
        }}
        onConfirmDelete={handleConfirmDelete}
        targetAttendees={attendeesToDelete}
        isBulk={isBulkDelete}
      />

      {/* Edit Attendee Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-300" />
              <span>Edit Attendee #{editingUser.id}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Modify registration details, access tier, and check-in status.
            </p>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={editingUser.age}
                    onChange={(e) => setEditingUser({ ...editingUser, age: parseInt(e.target.value, 10) || 0 })}
                    min="1"
                    max="120"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Ticket Tier</label>
                  <select
                    value={editingUser.ticket_type || 'General Access'}
                    onChange={(e) => setEditingUser({ ...editingUser, ticket_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  >
                    <option value="General Access">General Access</option>
                    <option value="VIP All-Access">VIP All-Access</option>
                    <option value="Speaker / Presenter">Speaker / Presenter</option>
                    <option value="Student / Innovator">Student / Innovator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Organization</label>
                  <input
                    type="text"
                    value={editingUser.organization || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, organization: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={editingUser.role || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-stone-200 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-stone-800 text-amber-50 text-xs font-bold shadow-md shadow-stone-900/15 transition disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




