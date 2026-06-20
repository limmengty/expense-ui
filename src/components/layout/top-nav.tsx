'use client';

import { GroupSwitcher } from '@/features/groups/components/group-switcher';

export function TopNav() {
  return (
    <div className="flex flex-1 items-center gap-4">
      <GroupSwitcher />
    </div>
  );
}
