'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/events');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-slate-400 text-xs">
      Routing to Multi-Event Hub...
    </div>
  );
}