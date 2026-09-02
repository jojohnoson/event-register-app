'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  MapPin, 
  UserCheck, 
  Layers, 
  Zap, 
  Award,
  ChevronRight,
  Check
} from 'lucide-react';

interface Session {
  id: string;
  time: string;
  title: string;
  speaker: string;
  role: string;
  category: 'Keynote' | 'Architecture' | 'Security' | 'Workshop' | 'Networking';
  room: string;
  description: string;
}

const AGENDA_SESSIONS: Session[] = [
  {
    id: 's1',
    time: '09:00 AM - 10:00 AM',
    title: 'Opening Keynote: The Future of Global Edge Platforms & AI Workloads',
    speaker: 'Dr. Sarah Lin',
    role: 'VP of Engineering, CloudCore Systems',
    category: 'Keynote',
    room: 'Main Grand Auditorium',
    description: 'Exploring next-generation distributed applications, edge serverless computing, and enterprise scalability.',
  },
  {
    id: 's2',
    time: '10:15 AM - 11:15 AM',
    title: 'High-Concurrency Database Architecture with Zero Latency',
    speaker: 'Marcus Vance',
    role: 'Principal Architect, DataScale Inc.',
    category: 'Architecture',
    room: 'Hall B (Tech Stage)',
    description: 'Deep-dive into serverless database sharding, transaction pooling, and ultra-low latency query optimization.',
  },
  {
    id: 's3',
    time: '11:30 AM - 12:45 PM',
    title: 'Zero-Trust Security & Identity Verification for Enterprise Registrations',
    speaker: 'Amira Patel',
    role: 'Chief Information Security Officer, SecureGuard',
    category: 'Security',
    room: 'Security Pavilion',
    description: 'Implementing cryptographic verification passes, biometric tokenization, and strict attendee data isolation.',
  },
  {
    id: 's4',
    time: '02:00 PM - 03:30 PM',
    title: 'Interactive Hands-on Workshop: Building Modern Agentic Applications',
    speaker: 'David Koenig',
    role: 'Lead AI Engineer, NextWave AI',
    category: 'Workshop',
    room: 'Innovation Lab 3',
    description: 'Step-by-step development workshop crafting autonomous micro-agent workflows and event triggers.',
  },
  {
    id: 's5',
    time: '04:00 PM - 06:00 PM',
    title: 'VIP & Speaker Networking Gala / Attendee Reception',
    speaker: 'Executive Hosts & Attendees',
    role: 'All Pass Holders Welcome',
    category: 'Networking',
    room: 'Skyline Terrace Lounge',
    description: 'Connect with industry leaders, founders, and fellow engineers with live refreshments and demos.',
  },
];

const CATEGORIES = ['All Tracks', 'Keynote', 'Architecture', 'Security', 'Workshop', 'Networking'] as const;

export const EventAgenda: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tracks');
  const [bookmarkedSessions, setBookmarkedSessions] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string) => {
    setBookmarkedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSessions = selectedCategory === 'All Tracks'
    ? AGENDA_SESSIONS
    : AGENDA_SESSIONS.filter((s) => s.category === selectedCategory);

  const getCategoryColor = (cat: Session['category']) => {
    switch (cat) {
      case 'Keynote': return 'bg-amber-500/20 text-amber-950 border-amber-500/30';
      case 'Architecture': return 'bg-white/10 text-slate-200 border-white/20';
      case 'Security': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Workshop': return 'bg-orange-100 text-orange-950 border-orange-300';
      case 'Networking': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-white/10 text-slate-200 border-white/20';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Official Event Schedule
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Keynotes, Sessions &amp; Masterclasses
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Explore the agenda tracks. All registered attendees receive full session access and materials.
          </p>
        </div>

        {/* Track Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/10 border border-white/20">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-900 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const isBookmarked = bookmarkedSessions.has(session.id);
          return (
            <div
              key={session.id}
              className="group p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-amber-700/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Time & Track */}
              <div className="md:w-56 shrink-0 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{session.room}</span>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(session.category)}`}>
                  {session.category}
                </span>
              </div>

              {/* Middle Column: Details */}
              <div className="flex-1 space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                  {session.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {session.description}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{session.speaker}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300">{session.role}</span>
                </div>
              </div>

              {/* Right Column: Bookmark Action */}
              <div className="shrink-0 flex items-center md:flex-col md:justify-center">
                <button
                  onClick={() => toggleBookmark(session.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isBookmarked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-slate-300 hover:text-white hover:bg-white/20/80'
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Added to Plan</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to My Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};




