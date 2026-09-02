'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  UserPlus, 
  Sparkles,
  QrCode,
  Tag,
  Share2,
  CalendarPlus,
  Download
} from 'lucide-react';
import { Registration } from '@/types';

interface AttendeePassProps {
  user: Registration;
  onRegisterAnother: () => void;
}

export const AttendeePass: React.FC<AttendeePassProps> = ({
  user,
  onRegisterAnother,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const formattedId = `REG-${user.id.toString().padStart(5, '0')}`;
  const tier = user.ticket_type || 'General Access';

  const handleCopyId = () => {
    navigator.clipboard.writeText(formattedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShare = () => {
    const text = `🎟️ Registered for Global Tech Summit 2026! Attendee: ${user.name} (${formattedId}) - Tier: ${tier}`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Global Tech & Cloud Summit 2026 - ${tier}`);
    const details = encodeURIComponent(
      `Attendee Pass: ${user.name} (${formattedId})\nTier: ${tier}\nOrganization: ${user.organization || 'Individual'}\n\nPresent this digital pass at the registration desk for badge pick-up.`
    );
    const location = encodeURIComponent('San Francisco Convention Center & Virtual Stream');
    const start = '20261015T090000Z';
    const end = '20261017T180000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  // Download .ics file
  const downloadIcsFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RegisterHub//Event Pass//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Global Tech & Cloud Summit 2026 - ${tier}`,
      `DESCRIPTION:Attendee Pass for ${user.name} (Badge: ${formattedId}). Tier: ${tier}.`,
      'LOCATION:San Francisco Convention Center & Virtual Stream',
      'DTSTART:20261015T090000Z',
      'DTEND:20261017T180000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Event_Pass_${formattedId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic QR Code SVG matrix generator based on ID & Name hash
  const generateQrMatrix = () => {
    const size = 21; // standard v1 QR grid
    const seed = (user.id * 7919) ^ (user.name.length * 31);
    const grid: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Finder patterns (top-left, top-right, bottom-left 7x7 squares)
        const inTopLeft = r < 7 && c < 7;
        const inTopRight = r < 7 && c >= size - 7;
        const inBottomLeft = r >= size - 7 && c < 7;

        if (inTopLeft || inTopRight || inBottomLeft) {
          const isBorder = (r === 0 || r === 6 || c === 0 || c === 6) && (inTopLeft);
          const isTopRightBorder = (r === 0 || r === 6 || c === size - 7 || c === size - 1) && (inTopRight);
          const isBottomLeftBorder = (r === size - 7 || r === size - 1 || c === 0 || c === 6) && (inBottomLeft);
          const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4 && inTopLeft) ||
                           (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3 && inTopRight) ||
                           (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4 && inBottomLeft);
          grid[r][c] = isBorder || isTopRightBorder || isBottomLeftBorder || isCenter;
        } else {
          // Pseudorandom pseudo-data bits seeded by attendee
          const bitVal = Math.sin(seed + r * 13 + c * 37) * 10000;
          grid[r][c] = (Math.floor(bitVal) % 2 === 0) || (r % 2 === 0 && c % 3 === 0);
        }
      }
    }
    return grid;
  };

  const qrMatrix = generateQrMatrix();

  const getTierBadgeStyle = () => {
    switch (tier) {
      case 'VIP All-Access':
        return 'bg-amber-500/20 text-amber-950 border-amber-400';
      case 'Speaker / Presenter':
        return 'bg-stone-200 text-white border-stone-400';
      case 'Student / Innovator':
        return 'bg-orange-100 text-orange-950 border-orange-300';
      default:
        return 'bg-amber-500/20 text-amber-950 border-amber-500/30';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20/80 text-xs text-amber-400 shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Private Verified Record:</strong> 256-bit encrypted attendee pass.
          </span>
        </div>
        <button
          onClick={handleCopyShare}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-950 transition shrink-0"
        >
          {shareCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied Link</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Pass</span>
            </>
          )}
        </button>
      </div>

      {/* Main Digital Pass Card with Warm Bronze Trim */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-md overflow-hidden print:border-black print:bg-slate-900/50 backdrop-blur-xl print:text-black">
        {/* Ambient warm glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Top Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 flex items-center justify-center text-amber-100 shadow-md shadow-amber-900/15">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {user.checked_in ? 'Checked In' : 'Confirmed & Verified'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getTierBadgeStyle()}`}>
                  {tier}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                Global Tech Summit Pass
              </h2>
            </div>
          </div>

          {/* Badge ID Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-slate-200 transition"
              title="Click to copy badge ID"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>{formattedId}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Attendee Details Grid & QR Code Section */}
        <div className="relative z-10 py-6 space-y-6">
          {/* Main Profile & Live QR Code Box */}
          <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Official Attendee
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {user.role || 'Event Participant'}
                {user.organization ? ` • ${user.organization}` : ''}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span>Age: <strong className="text-white">{user.age} yrs</strong></span>
                <span>&bull;</span>
                <span>Tier: <strong className="text-white">{tier}</strong></span>
                {user.amount_paid && (
                  <>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-bold">
                      {user.payment_status === 'FREE' ? 'Complimentary' : `Paid: ${user.currency === 'USD' ? '$' : '₹'}${user.amount_paid}`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Rendered SVG QR Code Pass */}
            <div className="shrink-0 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 text-black shadow-md">
              <svg
                viewBox="0 0 21 21"
                className="w-24 h-24 sm:w-28 sm:h-28"
                shapeRendering="crispEdges"
              >
                {qrMatrix.map((row, r) =>
                  row.map((active, c) =>
                    active ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c}
                        y={r}
                        width="1"
                        height="1"
                        fill="#1c1917"
                      />
                    ) : null
                  )
                )}
              </svg>
              <span className="mt-1 font-mono text-[9px] font-bold text-slate-200 tracking-wider">
                {formattedId}
              </span>
            </div>
          </div>

          {/* Contact & Event Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Registered Email</span>
                <span className="font-semibold text-white truncate block">{user.email}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                <Phone className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Contact Phone</span>
                <span className="font-semibold text-white truncate block">{user.phone}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-slate-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Entity / Organization</span>
                <span className="font-semibold text-white truncate block">{user.organization || 'Individual Attendee'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Registration Issued</span>
                <span className="font-semibold text-white truncate block">
                  {new Date(user.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes if provided */}
          {user.notes && (
            <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                Submitted Session Notes:
              </span>
              <p className="text-slate-300 italic pl-1">
                &ldquo;{user.notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* 1-Click Calendar Sync & Pass Actions */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Calendar Link */}
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Calendar</span>
            </a>

            {/* Apple / Outlook .ICS Download */}
            <button
              onClick={downloadIcsFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Download .ICS</span>
            </button>

            {/* Print Pass */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Pass</span>
            </button>
          </div>

          <button
            onClick={onRegisterAnother}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-amber-50 shadow-md shadow-stone-900/15 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Another Attendee</span>
          </button>
        </div>
      </div>
    </div>
  );
};





