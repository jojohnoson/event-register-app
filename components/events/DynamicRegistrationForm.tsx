'use client';

import React, { useState } from 'react';
import { Event, EventRegistration } from '@/types';
import {
  User, Mail, Phone, Calendar, Building2, Briefcase,
  FileText, Utensils, Shirt, Sparkles, AlertCircle,
  Loader2, ArrowRight, Layers, Flame, Users
} from 'lucide-react';

interface DynamicRegistrationFormProps {
  event: Event;
  onSuccess: (reg: EventRegistration) => void;
  onOpenLookup?: () => void;
}

const CREATIVE_INTEREST_TAGS = [
  'AI & Machine Learning',
  'Cloud Architecture',
  'Cybersecurity & Zero-Trust',
  'High-Scale DevOps & SRE',
  'Next.js & Frontend Engines',
  'Data Engineering & LLMs',
  'Venture & Tech Founders',
  'Autonomous AI Agents'
];

export const DynamicRegistrationForm: React.FC<DynamicRegistrationFormProps> = ({
  event,
  onSuccess,
  onOpenLookup,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    organization: '',
    role: '',
    notes: '',
    dietary: '',
    tshirt_size: 'L',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fields = event.form_fields || {};
  const currentCount = event.registration_count || 0;
  const maxCap = event.max_capacity || 0;
  const isCapped = maxCap > 0;
  const percentFilled = isCapped ? Math.min(100, Math.round((currentCount / maxCap) * 100)) : 0;
  const isAlmostFull = isCapped && percentFilled >= 80;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/registrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          organization: formData.organization,
          role: formData.role,
          notes: formData.notes,
          dietary: formData.dietary,
          tshirt_size: formData.tshirt_size,
          interest_tags: selectedTags,
          session_wishlist: selectedSessions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      if (data.registration) {
        onSuccess(data.registration);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-section" className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Urgency Bar */}
        <div className="relative z-10 pb-6 border-b border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Instant Digital Pass &bull; Free Admission
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Secure Your Event Pass
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Zero fees. Direct confirmation. Instant verified QR badge.
              </p>
            </div>

            {onOpenLookup && (
              <button
                type="button"
                onClick={onOpenLookup}
                className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition"
              >
                Already registered? Find Pass
              </button>
            )}
          </div>

          {/* Seat Urgency Meter */}
          {isCapped && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Users className="w-4 h-4 text-amber-400" />
                  Pass Capacity: <strong className="text-white">{currentCount} / {maxCap} Claimed</strong>
                </span>
                {isAlmostFull && (
                  <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                    <Flame className="w-3.5 h-3.5" /> Almost Full! Limited Seats Left
                  </span>
                )}
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isAlmostFull
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="relative z-10 mt-8 space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Core Dynamic Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <span>1. Attendee Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name (Always Enabled) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Email (Always Enabled) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. alex@cloudscale.io"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                  />
                </div>
              </div>

              {/* Phone */}
              {(fields.phone?.enabled ?? true) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Phone Number {fields.phone?.required && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 019-2831"
                      required={fields.phone?.required}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* Age */}
              {(fields.age?.enabled ?? true) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Age {fields.age?.required && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      placeholder="e.g. 28"
                      required={fields.age?.required}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* Organization */}
              {(fields.organization?.enabled ?? true) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Organization / Company {fields.organization?.required && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="e.g. Google / TechCorp"
                      required={fields.organization?.required}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* Role */}
              {(fields.role?.enabled ?? true) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Role / Title {fields.role?.required && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Senior Cloud Architect"
                      required={fields.role?.required}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* Dietary */}
              {fields.dietary?.enabled && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Dietary Requirements {fields.dietary?.required && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="dietary"
                      value={formData.dietary}
                      onChange={handleChange}
                      placeholder="e.g. Vegetarian / Vegan / Halal / None"
                      required={fields.dietary?.required}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition"
                    />
                  </div>
                </div>
              )}

              {/* T-Shirt Size */}
              {fields.tshirt_size?.enabled && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Attendee Swag T-Shirt Size
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Shirt className="w-4 h-4" />
                    </div>
                    <select
                      name="tshirt_size"
                      value={formData.tshirt_size}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition cursor-pointer"
                    >
                      <option value="XS">XS - Extra Small</option>
                      <option value="S">S - Small</option>
                      <option value="M">M - Medium</option>
                      <option value="L">L - Large</option>
                      <option value="XL">XL - Extra Large</option>
                      <option value="XXL">XXL - 2X Large</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {fields.notes?.enabled && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Special Accessibility or Accommodations
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Let our staff know if you have specific accessibility requests..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CREATIVE FEATURE: Interactive Tech Interest Tags */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>2. Customize Your Badge: Select Interests (Pick Any)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Printed directly on your pass</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CREATIVE_INTEREST_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-900 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CREATIVE FEATURE: Session Wishlist Picker */}
          {event.sessions && event.sessions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>3. Session Priority Wishlist (Reserved Seating)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Optional priority access</span>
              </div>

              <div className="space-y-2.5">
                {event.sessions.map((session) => {
                  const isChecked = selectedSessions.includes(session.id);
                  return (
                    <div
                      key={session.id}
                      onClick={() => toggleSession(session.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                          : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono font-bold">
                            {session.track}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{session.time}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{session.title}</h4>
                        <p className="text-xs text-slate-400">{session.speaker}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-stone-900 font-bold'
                            : 'border-white/20'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-stone-900 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] transition-all duration-300 text-base tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Secure QR Pass...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Confirm Registration &bull; Get Instant Pass</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Official attendee credential delivered instantly. No payment details required.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};