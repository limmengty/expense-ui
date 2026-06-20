'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, UserMinus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMutation } from '@tanstack/react-query';
import { removeGroupMemberAction } from '@/features/groups/actions';

interface RemoveMemberButtonProps {
  groupId: string;
  memberId: string;
  memberName: string;
  currentUserId: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function RemoveMemberButton({
  groupId,
  memberId,
  memberName,
  currentUserId,
}: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const remove = useMutation({
    mutationFn: () => removeGroupMemberAction(groupId, memberId),
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
    onError: () => {
      setOpen(false);
    },
  });

  const isSelf = memberId === currentUserId;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              {isSelf
                ? 'Are you sure you want to leave this group? This cannot be undone.'
                : `Remove ${memberName} from this group? They will no longer be able to see or contribute to group expenses.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{initials(memberName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{memberName}</p>
              {isSelf && <p className="text-xs text-muted-foreground">You (leaving group)</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
            >
              {remove.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="mr-1.5 h-4 w-4" />
              )}
              {isSelf ? 'Leave group' : 'Remove member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
