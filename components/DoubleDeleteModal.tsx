'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Trash2, 
  X, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  CornerDownRight, 
  UserX,
  FileWarning
} from 'lucide-react';
import { Registration } from '@/types';

export interface DeletableAttendee {
  id: number;
  name: string;
  email: string;
  attendee_id?: string;
  organization?: string | null;
  role?: string | null;
}

interface DoubleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (ids: number[]) => Promise<void>;
  targetAttendees: DeletableAttendee[];
  isBulk?: boolean;
  title?: string;
  description?: string;
  entityType?: 'attendee' | 'event';
}

export const DoubleDeleteModal: React.FC<DoubleDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  targetAttendees,
  isBulk = false,
  title,
  description,
  entityType = 'attendee',
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmationInput('');
      setError(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || targetAttendees.length === 0) return null;

  const targetAttendee = targetAttendees[0];
  const requiredPhrase = isBulk ? 'DELETE ALL' : 'DELETE';
  const isInputValid = confirmationInput.trim().toUpperCase() === requiredPhrase;

  const handleNextStep = () => {
    setStep(2);
    setError(null);
  };

  const handleFinalDelete = async () => {
    if (!isInputValid) {
      setError(`Please type "${requiredPhrase}" exactly to confirm deletion.`);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      const ids = targetAttendees.map((u) => u.id);
      await onConfirmDelete(ids);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete deletion.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient warning background warm glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 to-amber-700 flex items-center justify-center text-white shadow-md shadow-rose-900/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-700" /> Security Double Verification
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                Step {step} of 2
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {title || (isBulk ? `Delete ${targetAttendees.length} Attendee Records` : 'Permanent Record Deletion')}
            </h3>
          </div>
        </div>

        {/* STEP 1: Impact Warning & Target Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>Irreversible Administrative Action</span>
              </div>
              <p className="text-slate-300">
                {description || (
                  entityType === 'event'
                    ? 'This action will permanently delete the summit from the platform, including all associated attendee registrations and passes.'
                    : 'This action will permanently purge the registration record and invalidate any associated digital attendee passes from the database.'
                )}
              </p>
            </div>

            {/* Target Details */}
            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Target Record Details:
              </span>

              {isBulk ? (
                <div className="space-y-1 text-xs text-slate-300 max-h-36 overflow-y-auto pr-1">
                  {targetAttendees.map((u) => (
                    <div key={u.id} className="p-2 rounded-lg bg-white/10 flex items-center justify-between">
                      <span className="font-semibold text-white truncate">{u.name}</span>
                      <span className="font-mono text-amber-400 text-[11px]">{u.attendee_id || `REG-${u.id.toString().padStart(5, '0')}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">{entityType === 'event' ? 'Event Title:' : 'Attendee Name:'}</span>
                    <span className="font-semibold text-white">{targetAttendee.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">{entityType === 'event' ? 'URL Route:' : 'Email Address:'}</span>
                    <span className="font-mono text-slate-200">{targetAttendee.email}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">{entityType === 'event' ? 'Event ID:' : 'Badge ID:'}</span>
                    <span className="font-mono font-bold text-amber-400">
                      {targetAttendee.attendee_id || `REG-${targetAttendee.id.toString().padStart(5, '0')}`}
                    </span>
                  </div>
                  {targetAttendee.organization && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Organization:</span>
                      <span className="text-slate-200">{targetAttendee.organization}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition"
              >
                Cancel &amp; Keep Record
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md transition"
              >
                <span>Proceed to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Double Security Phrase Verification */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950">
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                Final Double Verification Safeguard
              </p>
              <p className="mt-1 text-slate-300">
                To prevent accidental deletion, please type{' '}
                <strong className="font-mono text-rose-800 px-1 py-0.5 rounded bg-rose-100 border border-rose-300">
                  {requiredPhrase}
                </strong>{' '}
                in the verification field below.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Type <span className="text-rose-700 font-bold">{requiredPhrase}</span> to unlock:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => {
                    setConfirmationInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={`Type "${requiredPhrase}" here...`}
                  autoFocus
                  disabled={isDeleting}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-rose-300 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm font-mono tracking-wider transition"
                />
                {isInputValid && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
              >
                &larr; Back to Step 1
              </button>
              <button
                type="button"
                onClick={handleFinalDelete}
                disabled={!isInputValid || isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Purging Record...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Permanent Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




