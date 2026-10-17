'use client';

import dynamic from 'next/dynamic';

// Dynamically import App with ssr: false to prevent browser API hydration mismatches
const PortfolioApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0e1a] flex flex-col items-center justify-center font-['JetBrains_Mono'] text-white">
      <div className="w-12 h-12 border-2 border-[#3584e4] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-white/70">Starting GNOME System...</p>
    </div>
  ),
});

export default function Home() {
  return <PortfolioApp />;
}

