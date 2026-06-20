'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface ExpenseFiltersProps {
  groups?: { id: string; name: string }[];
}

function ExpenseFiltersInner({ groups = [] }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [groupId, setGroupId] = useState(searchParams.get('group') ?? 'all');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateFilters = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === 'all' || !value) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      // Reset to page 0 when filters change
      newParams.delete('page');
      router.push(`/expenses?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      updateFilters({ q: value });
    }, 300);
  };

  const handleGroupChange = (value: string) => {
    setGroupId(value);
    updateFilters({ group: value });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateFilters({ status: value });
  };

  const clearFilters = () => {
    setSearch('');
    setGroupId('all');
    setStatus('all');
    clearTimeout(searchTimer.current);
    router.push('/expenses', { scroll: false });
  };

  const hasActiveFilters = search || groupId !== 'all' || status !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by description or group…"
          value={search}
          onChange={handleSearchChange}
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              clearTimeout(searchTimer.current);
              updateFilters({ q: '' });
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Group</Label>
        <Select value={groupId} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Status</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}

export function ExpenseFilters(props: ExpenseFiltersProps) {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <ExpenseFiltersInner {...props} />
    </Suspense>
  );
}
