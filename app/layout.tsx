import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RegisterHub - Attendee Registration & Directory',
  description: 'Fast, secure attendee registration and event management platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${jakarta.className} bg-[#080a0f] text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
