'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Ticket, QrCode, MapPin } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: 'How do I receive and access my digital attendee badge?',
    answer: 'Immediately upon submitting your registration, your personalized Digital Attendee Pass is generated with a unique Badge ID and encrypted QR Code. You can print it, save it, or retrieve it anytime using the "Find My Attendee Pass" lookup by entering your registered email.',
    category: 'Badging',
  },
  {
    id: 'f2',
    question: 'Can I add the event schedule to my Apple or Google Calendar?',
    answer: 'Yes! On your Digital Attendee Pass, simply click the "Add to Google Calendar" or "Download .ICS" button to automatically sync conference dates, session times, and venue location with your personal calendar.',
    category: 'Schedule',
  },
  {
    id: 'f3',
    question: 'How is my private registration information secured?',
    answer: 'RegisterHub enforces strict zero-trust data isolation with 256-bit encryption. Attendee contact details (email, phone, personal notes) are never made public. Only authenticated event administrators with full security privileges have directory access.',
    category: 'Security',
  },
  {
    id: 'f4',
    question: 'What if I need to update my details or cancel my registration?',
    answer: 'If you need to make changes to your contact information or organization affiliation, you can reach out to the event organizers via the Admin Portal contact, or re-verify through your digital pass.',
    category: 'Policy',
  },
  {
    id: 'f5',
    question: 'Is virtual attendance supported for remote participants?',
    answer: 'Yes, all registered attendees receive direct high-definition live stream links and virtual breakout room access for keynote speeches and technical workshops.',
    category: 'Access',
  },
];

export const EventFAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('f1');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Attendee Support &amp; FAQ
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Everything you need to know about registering, digital passes, venue access, and privacy.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-sm overflow-hidden transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-700" />
                  <span className="text-sm sm:text-base font-bold text-white">{faq.question}</span>
                </div>
                <div
                  className={`w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-white text-amber-50 border-stone-900' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/10/80 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};




