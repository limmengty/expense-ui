'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { renameGroupAction } from '@/features/groups/actions';

interface RenameGroupDialogProps {
  groupId: string;
  currentName: string;
  children: React.ReactNode;
}

export function RenameGroupDialog({ groupId, currentName, children }: RenameGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const router = useRouter();

  function handleOpenChange(next: boolean) {
    if (next) setName(currentName);
    setOpen(next);
  }

  const rename = useMutation({
    mutationFn: (newName: string) => renameGroupAction(groupId, newName),
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
  });

  const canSubmit = name.trim() && name.trim() !== currentName;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Rename group</DialogTitle>
          <DialogDescription>Choose a new name for &ldquo;{currentName}&rdquo;.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) rename.mutate(name.trim());
              }}
              autoFocus
              maxLength={255}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => rename.mutate(name.trim())} disabled={!canSubmit || rename.isPending}>
            Save name
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
