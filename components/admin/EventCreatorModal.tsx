'use client';

import React, { useState } from 'react';
import { Event, FormFields, SessionTrack } from '@/types';
import { FormFieldsBuilder } from '@/components/admin/FormFieldsBuilder';
import { SessionsBuilder } from '@/components/admin/SessionsBuilder';
import { X, Sparkles, Loader2, Video, Image as ImageIcon, Calendar, ShieldCheck } from 'lucide-react';

interface EventCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editEvent?: Event | null;
  adminToken: string;
}

export const EventCreatorModal: React.FC<EventCreatorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editEvent,
  adminToken,
}) => {
  const [title, setTitle] = useState(editEvent?.title || '');
  const [slug, setSlug] = useState(editEvent?.slug || '');
  const [description, setDescription] = useState(editEvent?.description || '');
  const [mediaUrl, setMediaUrl] = useState(
    editEvent?.media_url || 'https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4'
  );
  const [mediaType, setMediaType] = useState<'video' | 'image'>(editEvent?.media_type || 'video');

  const defaultStart = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16);
  const defaultEnd = new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 16);
  const defaultDeadline = new Date(Date.now() + 13 * 86400000).toISOString().slice(0, 16);

  const [startDate, setStartDate] = useState(
    editEvent?.start_date ? new Date(editEvent.start_date).toISOString().slice(0, 16) : defaultStart
  );
  const [endDate, setEndDate] = useState(
    editEvent?.end_date ? new Date(editEvent.end_date).toISOString().slice(0, 16) : defaultEnd
  );
  const [deadline, setDeadline] = useState(
    editEvent?.registration_deadline ? new Date(editEvent.registration_deadline).toISOString().slice(0, 16) : defaultDeadline
  );
  const [maxCapacity, setMaxCapacity] = useState(editEvent?.max_capacity ? String(editEvent.max_capacity) : '250');

  const [formFields, setFormFields] = useState<FormFields>(
    editEvent?.form_fields || {
      name: { enabled: true, required: true },
      email: { enabled: true, required: true },
      phone: { enabled: true, required: true },
      age: { enabled: true, required: false },
      organization: { enabled: true, required: false },
      role: { enabled: true, required: false },
      dietary: { enabled: false, required: false },
      tshirt_size: { enabled: false, required: false },
      notes: { enabled: true, required: false },
    }
  );

  const [sessions, setSessions] = useState<SessionTrack[]>(editEvent?.sessions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editEvent) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setError(null);
    if (!title.trim()) {
      setError('Please enter an event title');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please provide start and end dates');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        slug,
        description,
        media_url: mediaUrl,
        media_type: mediaType,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        registration_deadline: deadline ? new Date(deadline).toISOString() : null,
        max_capacity: parseInt(maxCapacity || '0', 10),
        status,
        form_fields: formFields,
        sessions,
      };

      const url = editEvent
        ? `/api/admin/events/${editEvent.id}`
        : '/api/admin/events';

      const method = editEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Saving failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8 my-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-xs font-bold text-amber-400 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Event Architect
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {editEvent ? 'Edit Event Configuration' : 'Create & Publish New Event'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic registration forms, sessions, media backgrounds, and capacity limits.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Basic Event Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
            1. Core Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Event Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. NextGen AI & Cloud Summit"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Public Slug (URL: /events/slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nextgen-ai-cloud-summit"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-amber-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Event Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the summit themes, keynote highlights, and networking tracks..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Media & Background */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
            2. Hero Video / Media Background
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Media URL (MP4 Video or Image)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Media Type
              </label>
              <div className="flex rounded-xl bg-slate-950 border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    mediaType === 'video' ? 'bg-amber-500 text-stone-900' : 'text-slate-400'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                    mediaType === 'image' ? 'bg-amber-500 text-stone-900' : 'text-slate-400'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Schedule & Capacity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
            3. Schedule &amp; Capacity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Event Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Event End Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Max Capacity (0 = Unlimited)
              </label>
              <input
                type="number"
                min="0"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Dynamic Form Builder */}
        <div className="space-y-4">
          <FormFieldsBuilder value={formFields} onChange={setFormFields} />
        </div>

        {/* Section 5: Sessions Builder */}
        <div className="space-y-4">
          <SessionsBuilder value={sessions} onChange={setSessions} />
        </div>

        {/* Actions Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('draft')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('published')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Event...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Event Publicly</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};