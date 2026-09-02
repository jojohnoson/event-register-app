'use client';

import React from 'react';
import { SessionTrack } from '@/types';
import { Plus, Trash2, Layers } from 'lucide-react';

interface SessionsBuilderProps {
  value: SessionTrack[];
  onChange: (sessions: SessionTrack[]) => void;
}

export const SessionsBuilder: React.FC<SessionsBuilderProps> = ({
  value,
  onChange,
}) => {
  const addSession = () => {
    const newSession: SessionTrack = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      title: '',
      speaker: '',
      time: '10:00 AM - 11:30 AM',
      track: 'Keynote',
    };
    onChange([...value, newSession]);
  };

  const updateSession = (id: string, field: keyof SessionTrack, val: any) => {
    onChange(
      value.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const removeSession = (id: string) => {
    onChange(value.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Event Sessions &amp; Tracks</h4>
        </div>
        <button
          type="button"
          onClick={addSession}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Session</span>
        </button>
      </div>

      {value.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-400">No specific sessions defined yet.</p>
          <button
            type="button"
            onClick={addSession}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
          >
            + Add keynote or workshop session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((session, index) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Session #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSession(session.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2 space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) => updateSession(session.id, 'title', e.target.value)}
                    placeholder="e.g. Next-Gen Cloud Architecture"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    Speaker / Host
                  </label>
                  <input
                    type="text"
                    value={session.speaker}
                    onChange={(e) => updateSession(session.id, 'speaker', e.target.value)}
                    placeholder="e.g. Dr. Sarah Lin"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    Track / Category
                  </label>
                  <select
                    value={session.track}
                    onChange={(e) => updateSession(session.id, 'track', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Keynote">Keynote</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Security">Security</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};