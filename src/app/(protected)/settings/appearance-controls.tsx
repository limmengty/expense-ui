'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';

function useHydrated() {
  // React's official hydration-safe pattern — subscribe never fires, so no cascading renders.
  // This is the canonical next-themes approach to avoid SSR/client mismatch.
  return React.useSyncExternalStore(() => () => {}, () => true, () => false);
}

export function AppearanceControls() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-9" />;

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
        className="gap-1.5"
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="gap-1.5"
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('system')}
        className="gap-1.5"
      >
        <Monitor className="h-3.5 w-3.5" />
        System
      </Button>
    </div>
  );
}
