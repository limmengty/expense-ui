'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getGroupsAction } from '@/features/groups/actions';

export function GroupSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroupsAction(),
    staleTime: 60 * 1000,
  });

  const handleGroupChange = (groupId: string) => {
    if (groupId === 'all') {
      router.push('/groups');
    } else {
      router.push(`/groups/${groupId}`);
    }
  };

  // Extract current groupId from pathname
  const currentGroupId = pathname.startsWith('/groups/') ? pathname.split('/groups/')[1] : 'all';

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Select value={currentGroupId} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
