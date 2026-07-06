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
      className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
      style={{ backgroundColor: 'var(--brand)', color: '#fff' }}
      title="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}
