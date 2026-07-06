'use client';

import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FloatingHomeButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--brand)', color: '#fff' }}
    >
      <ArrowUp className="w-5 h-5" />
      <span className="text-sm font-bold">Top</span>
    </button>
  );
}
