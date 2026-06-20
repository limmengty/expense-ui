'use client';

import { useState, useEffect, useTransition } from 'react';
import { UserPlus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { searchUsersAction } from '@/features/users/actions';
import { addGroupMemberAction } from '@/features/groups/actions';
import type { UserSearchResult } from '@/features/users/api';

interface AddMemberDialogProps {
  groupId: string;
  /** IDs of users already in the group — excluded from results */
  existingMemberIds: string[];
  children: React.ReactNode;
}

export function AddMemberDialog({ groupId, existingMemberIds, children }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setAddedIds(new Set());
      setAddingIds(new Set());
      return;
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      startSearch(async () => {
        const data = await searchUsersAction(query.trim());
        const existing = new Set([...existingMemberIds, ...addedIds]);
        setResults(data.filter((u) => !existing.has(u.id)));
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [query, existingMemberIds, addedIds]);

  function handleAdd(user: UserSearchResult) {
    setAddingIds((prev) => new Set([...prev, user.id]));
    addGroupMemberAction(groupId, user.id).then((result) => {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
      if (result.success) {
        setAddedIds((prev) => new Set([...prev, user.id]));
        setResults((prev) => prev.filter((u) => u.id !== user.id));
      }
    });
  }

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search for a user by name or email to invite to this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="min-h-[120px] space-y-1">
            {isSearching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isSearching && query.trim().length >= 2 && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {addedIds.size > 0 ? 'No more users to add' : 'No users found'}
              </p>
            )}

            {!isSearching &&
              results.map((user) => {
                const isAddingThis = addingIds.has(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button size="sm" disabled={isAddingThis} onClick={() => handleAdd(user)}>
                      {isAddingThis ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-1.5 h-4 w-4" />
                      )}
                      {isAddingThis ? 'Adding…' : 'Add'}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
