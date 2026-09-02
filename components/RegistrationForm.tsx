'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Check,
  Search,
} from 'lucide-react';
import { Registration } from '@/types';

interface RegistrationFormProps {
  /** Callback invoked after a successful registration. */
  onSuccess: (newUser: Registration) => void;
  /** Optional handler to open a lookup modal for existing passes. */
  onOpenLookup?: () => void;
  /** Identifier of the event for which the registration is being made. */
  eventId: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onOpenLookup,
  eventId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    organization: '',
    role: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client‑side validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setErrorMessage('Please enter a valid age between 1 and 120.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/registrations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      onSuccess(data.registration);
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      organization: '',
      role: '',
      notes: '',
    });
  };

  return (
    <div id="register-section" className="w-full">
      <div className="relative rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
        {/* Ambient warm glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Secure Event Registration
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Attendee Registration
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Fill in your details to receive an instant QR pass.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 mt-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Attendee Details */}
          <div className="space-y-4 pt-2">
            {/* Full Name */}
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
                  placeholder="e.g. John Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="e.g. john@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Phone Number <span className="text-rose-500">*</span>
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
                  placeholder="e.g. +1 (555) 000-1234"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Age <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Organization / Company
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
                  placeholder="e.g. TechCorp / University"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Role / Designation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Role / Designation
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
                  placeholder="e.g. Software Engineer / Student"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Additional Notes / Special Requirements
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-500">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements, dietary notes..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-stone-900/15 transition text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register &amp; Get QR Pass</span>
                </>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenLookup && (
              <button
                type="button"
                onClick={onOpenLookup}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 text-sm font-medium transition"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>Find Existing Pass</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
