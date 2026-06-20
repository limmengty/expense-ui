import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // React's official hydration-safe media-query pattern.
  // onToggle always returns a no-op; the subscribe callback never fires, so no cascading renders.
  return React.useSyncExternalStore(
    () => () => {},
    () => false,
    () => typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
      : false,
  );
}
