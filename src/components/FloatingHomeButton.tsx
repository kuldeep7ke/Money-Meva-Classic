'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
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
    <Link
      href="/"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--brand)', color: '#fff' }}
    >
      <Home className="w-5 h-5" />
      <span className="text-sm font-semibold">Home</span>
    </Link>
  );
}
