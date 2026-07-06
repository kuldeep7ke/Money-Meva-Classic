'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(threshold = 50) {
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < threshold) {
        setHidden(false);
      } else {
        const delta = y - lastScroll.current;
        if (delta > 5) setHidden(true);
        else if (delta < -5) setHidden(false);
      }
      lastScroll.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}
