'use client';

import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/auth';

interface SplitEntry {
  userId: string;
  amount?: number;
  percentage?: number;
}

interface AddExpenseSplitsProps {
  members: { id: string; name: string }[];
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  totalAmount: number;
  onSplitsChange: (splits: SplitEntry[]) => void;
}

export function AddExpenseSplits({
  members,
  splitType,
  totalAmount,
  onSplitsChange,
}: AddExpenseSplitsProps) {
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  // Stable ref so effects don't need onSplitsChange in their dep array
  const onSplitsChangeRef = useRef(onSplitsChange);
  onSplitsChangeRef.current = onSplitsChange;

  // Re-initialize whenever members list changes (includes group switch)
  useEffect(() => {
    if (members.length === 0) {
      flushSync(() => {
        setSplits([]);
        onSplitsChangeRef.current([]);
      });
      return;
    }
    const initial = members.map((m) => {
      if (splitType === 'EQUAL') return { userId: m.id, amount: totalAmount / members.length };
      if (splitType === 'PERCENTAGE') return { userId: m.id, percentage: 100 / members.length };
      return { userId: m.id };
    });
    flushSync(() => {
      setSplits(initial);
      onSplitsChangeRef.current(initial);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  // Recalculate + sync form when amount or split type changes
  useEffect(() => {
    if (members.length === 0) return;
    const updated = members.map((m) => {
      if (splitType === 'EQUAL') return { userId: m.id, amount: totalAmount / members.length };
      if (splitType === 'PERCENTAGE') return { userId: m.id, percentage: 100 / members.length };
      return { userId: m.id };
    });
    flushSync(() => {
      setSplits(updated);
      onSplitsChangeRef.current(updated);
    });
  }, [totalAmount, splitType, members.length, members]);

  const updateSplit = (userId: string, field: 'amount' | 'percentage', value: number) => {
    setSplits((prev) => {
      const updated = prev.map((s) => (s.userId === userId ? { ...s, [field]: value } : s));
      onSplitsChangeRef.current(updated);
      return updated;
    });
  };

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">Select a group to see split options</p>;
  }

  return (
    <div className="space-y-3">
      <Label>Split Details</Label>
      <div className="space-y-2 rounded-md border p-3">
        {members.map((member) => {
          const split = splits.find((s) => s.userId === member.id);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <span className="flex-1 text-sm">{member.name}</span>
              {splitType === 'EQUAL' && (
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(split?.amount ?? 0)}
                </span>
              )}
              {splitType === 'EXACT' && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-28"
                  value={split?.amount ?? ''}
                  onChange={(e) =>
                    updateSplit(member.id, 'amount', parseFloat(e.target.value) || 0)
                  }
                />
              )}
              {splitType === 'PERCENTAGE' && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-20"
                    value={split?.percentage ?? ''}
                    onChange={(e) =>
                      updateSplit(member.id, 'percentage', parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
            </div>
          );
        })}

        {splitType === 'PERCENTAGE' && (
          <div className="border-t pt-2 text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">
              {splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0).toFixed(1)}%
            </span>
          </div>
        )}
        {splitType === 'EXACT' && (
          <div className="border-t pt-2 text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">
              {formatCurrency(splits.reduce((sum, s) => sum + (s.amount ?? 0), 0))}
            </span>
            <span className="ml-2 text-muted-foreground">/ {formatCurrency(totalAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
