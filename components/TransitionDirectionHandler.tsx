'use client';

import { useEffect } from 'react';
import { setTransitionDirection } from '@/components/TransitionLink';

/**
 * Sets transition direction to 'back' on browser back/forward
 * so the slide animation matches (new from left).
 */
export function TransitionDirectionHandler() {
  useEffect(() => {
    const handlePopState = () => {
      setTransitionDirection('back');
    };
    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, []);
  return null;
}
