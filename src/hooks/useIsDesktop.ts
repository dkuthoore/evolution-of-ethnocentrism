import { useEffect, useState } from 'react';
import { MIN_DESKTOP_WIDTH_PX } from '../lib/constants';

/**
 * Returns true when viewport width is at least MIN_DESKTOP_WIDTH_PX (desktop layout).
 * Updates on resize so the app can switch between desktop view and "desktop only" message.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(`(min-width: ${MIN_DESKTOP_WIDTH_PX}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MIN_DESKTOP_WIDTH_PX}px)`);
    const handler = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', handler);
    handler(); // set once in case initial state was wrong (e.g. hydration)
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
