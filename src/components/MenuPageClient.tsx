// src/components/MenuPageClient.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MenuExplorer from '@/components/MenuExplorer';

export default function MenuPageClient({
  locale,
  data,
}: {
  locale: string;
  data: typeof import('@/components/MenuExplorer').MOCK_MENU;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="relative">
      {/* Screen Reader */}
      <span className="sr-only" aria-live="polite">
        {locale === 'en' ? 'Menu loaded' : 'Menu chargé'}
      </span>

      {/* Menu */}
      <MenuExplorer sections={data} />

      {/* Floating Footer */}
      <footer className="fixed bottom-0 w-full z-50 px-6 py-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div className="flex gap-3 pointer-events-auto">
            <button
              onClick={() => setChatOpen(true)}
              className="h-14 w-14 rounded-full bg-white border border-[#2D2D2D]/10 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              title="Concierge"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {chatOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
            />

            {/* PANEL */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              className="fixed bottom-0 left-0 right-0 z-70 max-w-xl mx-auto"
            >
              <div className="bg-[#14110d] border border-[#c17f3b]/20 rounded-t-3xl shadow-2xl overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#c17f3b]/10">
                  <p className="text-sm tracking-widest text-[#c17f3b] uppercase">
                    Concierge
                  </p>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* MESSAGES */}
                <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto text-sm text-white/80">
                  <div className="bg-[#c17f3b]/10 border border-[#c17f3b]/20 p-3 rounded-xl">
                    Welcome. How can I assist your dining experience tonight?
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl ml-auto max-w-[80%]">
                    Do you recommend something light?
                  </div>
                  <div className="bg-[#c17f3b]/10 border border-[#c17f3b]/20 p-3 rounded-xl">
                    The Tabbouleh or Fattoush would be perfect.
                  </div>
                </div>

                {/* INPUT */}
                <div className="p-4 border-t border-[#c17f3b]/10 flex gap-2">
                  <input
                    placeholder="Ask something..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  />
                  <button className="px-4 rounded-xl bg-[#c17f3b] text-black text-xs font-semibold">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}