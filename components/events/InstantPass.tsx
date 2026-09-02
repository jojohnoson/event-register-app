'use client';

import React, { useEffect, useState } from 'react';
import { EventRegistration, Event } from '@/types';
import {
  Sparkles, Calendar, Clock, MapPin, Download,
  Printer, Share2, CheckCircle2, ShieldCheck, QrCode
} from 'lucide-react';

interface InstantPassProps {
  registration: EventRegistration;
  event: Event;
  onRegisterAnother?: () => void;
}

export const InstantPass: React.FC<InstantPassProps> = ({
  registration,
  event,
  onRegisterAnother,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadQr() {
      try {
        const res = await fetch(`/api/registrations/qr?attendee_id=${encodeURIComponent(registration.attendee_id)}`);
        const data = await res.json();
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl);
        }
      } catch (e) {
        console.error('Error loading QR code:', e);
      }
    }
    loadQr();
  }, [registration.attendee_id]);

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  // 1. Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const formatGDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `Official Attendee Pass: ${registration.attendee_id}\nName: ${registration.name}\n${event.description || ''}`
    );
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=Main+Summit+Hall`;
  };

  // 2. Download .ICS Calendar File
  const handleDownloadIcs = () => {
    const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RegisterHub//Multi-Event Portal//EN',
      'BEGIN:VEVENT',
      `UID:${registration.attendee_id}@registerhub.io`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Official Attendee Badge: ${registration.attendee_id} for ${registration.name}`,
      'LOCATION:Main Convention Center & Virtual Stream',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.slug}-pass.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Print / Save PDF
  const handlePrint = () => {
    window.print();
  };

  // 4. Share Pass
  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `I'm attending ${event.title}! My Attendee Pass: ${registration.attendee_id}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Success Notification Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Registration Confirmed &bull; Pass Issued!
            </h3>
            <p className="text-xs text-emerald-300/80">
              Welcome aboard, <strong>{registration.name}</strong>. Present this pass at venue check-in.
            </p>
          </div>
        </div>

        {onRegisterAnother && (
          <button
            onClick={onRegisterAnother}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition shrink-0"
          >
            + Register Another
          </button>
        )}
      </div>

      {/* Digital Attendee Pass Card */}
      <div className="relative rounded-3xl bg-slate-900/90 border-2 border-amber-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Amber top glow bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left 2 Cols: Attendee & Event Metadata */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300">
                Official Digital Pass
              </span>
              {registration.is_early_bird && (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 animate-pulse">
                  🎯 Early Bird Attendee
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Verified
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {event.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Main Convention Hall
                </span>
              </div>
            </div>

            {/* Attendee Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendee Name</span>
                <p className="text-sm font-bold text-white mt-0.5">{registration.name}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">{registration.email}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Credential ID</span>
                <p className="text-sm font-mono font-black text-amber-400 mt-0.5 tracking-wider">
                  {registration.attendee_id}
                </p>
              </div>

              {registration.organization && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Organization</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{registration.organization}</p>
                </div>
              )}

              {registration.role && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Role / Title</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{registration.role}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</span>
                <p className="text-sm font-bold text-slate-200 mt-0.5">
                  {new Date(registration.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Interest Tags */}
            {registration.interest_tags && registration.interest_tags.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                  Selected Tracks &amp; Focus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {registration.interest_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Verified QR Code Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner space-y-3">
            <div className="w-48 h-48 rounded-xl bg-[#080a0f] p-2 border-2 border-amber-500/30 flex items-center justify-center shadow-lg">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Attendee QR Badge" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <QrCode className="w-12 h-12 animate-pulse text-amber-500/60" />
                  <span className="text-xs">Generating QR...</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-widest block">
                {registration.attendee_id}
              </span>
              <span className="text-[10px] text-slate-400">Scan at entrance scanner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export / Calendar Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-xs font-bold text-white transition shadow-sm"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Google Calendar</span>
        </a>

        <button
          onClick={handleDownloadIcs}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-xs font-bold text-white transition shadow-sm"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Download .ICS</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-xs font-bold text-white transition shadow-sm"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print / PDF</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-xs font-bold text-white transition shadow-sm"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
        </button>
      </div>
    </div>
  );
};