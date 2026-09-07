'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, Ticket, CalendarCheck, Lock } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: 'What is "Find My Pass" and how does it work?',
    answer:
      'Find My Pass provides zero-friction credential retrieval. Simply input the verified email address associated with your registration. RegisterHub instantly retrieves your verified digital pass along with your unique Credential ID and session accreditations—no app installation or passwords required.',
    icon: <Ticket className="w-4 h-4 text-amber-400" />,
  },
  {
    question: 'How does the summit registration and accreditation process operate?',
    answer:
      'Registration takes under 60 seconds. Select your target summit, complete the verified attendee profile, choose your desired keynote workshops and specialized track sessions, and your complimentary digital pass is generated immediately with live countdown and calendar sync.',
    icon: <CalendarCheck className="w-4 h-4 text-amber-400" />,
  },
  {
    question: 'How are my personal data and credential passes protected?',
    answer:
      'RegisterHub employs 256-bit SSL encryption and strict serverless database isolation with Neon PostgreSQL. We never sell, monetize, or publicly disclose attendee details. In-browser caching is strictly tab-scoped to completely prevent cross-user data leakage on shared computers.',
    icon: <Lock className="w-4 h-4 text-amber-400" />,
  },
  {
    question: 'Can I register for multiple summits or modify my track preferences?',
    answer:
      'Yes. Our unified multi-event architecture permits attendance across multiple distinct summits. If you need to update session wishlist choices or contact information, simply access Find My Pass or consult our summit concierge desk.',
    icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-4xl mx-auto space-y-8 pt-12 pb-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-bold text-amber-300 backdrop-blur-xl">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Information &amp; Insights</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Everything you need to know about summit credentials, digital access, and institutional security.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={false}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-slate-950/80 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)]'
                  : 'bg-slate-950/45 border-white/10 hover:border-white/20 hover:bg-slate-950/60'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {faq.icon}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 p-1.5 rounded-lg bg-white/5 text-slate-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-300/90 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
