import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RegisterHub — Premier Event Registration Platform',
  description:
    'Secure, instant attendee registration and digital pass issuance for world-class technology summits and exclusive conferences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${jakarta.className} bg-[#080a0f] text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-white`}
      >
        {/* ── Persistent Global Video Background ──────────────────────────
            Mounted once in the root layout so it never restarts during
            client-side navigation. Fixed positioning ensures full-bleed
            coverage on every route without disrupting document flow.       */}
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 -z-20 w-full h-full object-cover pointer-events-none"
        >
          <source
            src="https://res.cloudinary.com/dnv6jxv52/video/upload/v1788427039/download_2.mp4"
            type="video/mp4"
          />
          <track kind="captions" srcLang="en" label="English" default={false} />
        </video>

        {/* ── Dynamic Dark Gradient Contrast Overlay ───────────────────────
            Ensures every foreground element — text, cards, buttons — retains
            crisp, high-contrast legibility across all screen sizes and routes. */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/50 to-black/90 backdrop-blur-[2px] pointer-events-none"
        />

        {children}
      </body>
    </html>
  );
}
