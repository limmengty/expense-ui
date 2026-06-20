import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UserPlus, CheckCircle2, AlertCircle, Plus, ExternalLink, Pencil } from 'lucide-react';
import { PageLayout, PageHeader, PageSection } from '@/components/layout/page-layout';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AddMemberDialog } from '@/features/groups/components/add-member-dialog';
import { AddExpenseDialog } from '@/features/expenses/components/add-expense-dialog';
import { RecordSettlementButton } from '@/features/groups/components/record-settlement-button';
import { RemoveMemberButton } from '@/features/groups/components/remove-member-button';
import { RenameGroupDialog } from '@/features/groups/components/rename-group-dialog';
import { getSession } from '@/features/auth/actions';
import type { GroupDTO, GroupBalances, GroupMemberDTO } from '@/features/groups/api';
import type { PaginatedExpenses } from '@/features/expenses/api';

interface Props {
  params: Promise<{ groupId: string }>;
}

async function getGroupDetailData(groupId: string) {
  const [group, balances, expenses, members] = await Promise.allSettled([
    api.get<GroupDTO>(API_ENDPOINTS.GROUP_BY_ID(groupId)),
    api.get<GroupBalances>(API_ENDPOINTS.GROUP_BALANCES(groupId)),
    api.get<PaginatedExpenses>(`${API_ENDPOINTS.GROUP_EXPENSES(groupId)}?size=20`),
    api.get<GroupMemberDTO[]>(API_ENDPOINTS.GROUP_MEMBERS(groupId)),
  ]);

  return {
    group: group.status === 'fulfilled' ? group.value : null,
    balances: balances.status === 'fulfilled' ? balances.value : null,
    expenses: expenses.status === 'fulfilled' ? expenses.value : null,
    members: members.status === 'fulfilled' ? members.value : [],
  };
}

function formatAmount(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function GroupDetailPage({ params }: Props) {
  const [{ groupId }, session] = await Promise.all([params, getSession()]);
  if (!session) return null;

  const { group, balances, expenses, members } = await getGroupDetailData(groupId);
  if (!group) notFound();

  const memberMap = new Map(members.map((m) => [m.userId, m]));

  function memberName(userId: string) {
    return memberMap.get(userId)?.name ?? `User ${userId.slice(0, 8)}`;
  }

  const pendingExpenses = expenses?.content.filter((e) => !e.settled) ?? [];
  const settledExpenses = expenses?.content.filter((e) => e.settled) ?? [];
  const totalCount = expenses?.totalElements ?? 0;
  const hasOutstandingBalance = (balances?.transfers.length ?? 0) > 0;

  return (
    <PageLayout maxWidth="4xl">
      <PageHeader
        backHref="/groups"
        title={
          <span className="flex items-center gap-2">
            {group.name}
            <RenameGroupDialog groupId={groupId} currentName={group.name}>
              <button className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </RenameGroupDialog>
          </span>
        }
        description={
          <>
            {members.length} member{members.length !== 1 ? 's' : ''} · {totalCount} expense
            {totalCount !== 1 ? 's' : ''}
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <AddExpenseDialog groups={[{ id: groupId, name: group.name }]} defaultGroupId={groupId}>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Add expense
              </Button>
            </AddExpenseDialog>
            <AddMemberDialog groupId={groupId} existingMemberIds={members.map((m) => m.userId)}>
              <Button size="sm" variant="outline">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Add member
              </Button>
            </AddMemberDialog>
          </div>
        }
      />

      {/* Balance status banner */}
      <PageSection index={0}>
        <div
          className={`flex items-center gap-4 rounded-xl border p-4 ${
            hasOutstandingBalance
              ? 'border-warning bg-warning/10 text-warning'
              : 'border-primary/20 bg-primary/5 text-primary'
          }`}
        >
          {hasOutstandingBalance ? (
            <>
              <AlertCircle className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Outstanding balances</p>
                <p className="text-xs text-muted-foreground">
                  {balances!.transfers.length} payment
                  {balances!.transfers.length !== 1 ? 's' : ''} needed to settle up
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-sm font-semibold">All settled up!</p>
                <p className="text-xs text-muted-foreground">
                  No outstanding balances in this group
                </p>
              </div>
            </>
          )}
        </div>
      </PageSection>

      <div className="grid gap-8 pt-6 lg:grid-cols-5">
        {/* Expenses — 3/5 */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Expenses
            </h2>
            {totalCount > 20 && (
              <Link
                href={`/expenses?group=${groupId}`}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View all {totalCount}
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {!expenses || expenses.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <p className="text-sm font-medium">No expenses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add an expense to start tracking</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Pending expenses */}
              {pendingExpenses.map((expense) => (
                <div
                  key={expense.expenseId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">
                      {expense.description.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {memberName(expense.payerId)} ·{' '}
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatAmount(expense.amount.amount, expense.amount.currency)}
                  </p>
                </div>
              ))}

              {/* Settled expenses — collapsed visually */}
              {settledExpenses.length > 0 && (
                <>
                  <div className="py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Settled ({settledExpenses.length})
                    </p>
                  </div>
                  {settledExpenses.map((expense) => (
                    <div
                      key={expense.expenseId}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 opacity-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm text-muted-foreground line-through">
                          {expense.description}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {formatAmount(expense.amount.amount, expense.amount.currency)}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Members + Settlements — 2/5 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Members */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Members
            </h2>
            <div className="divide-y rounded-xl border">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    {member.email && (
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                  <RemoveMemberButton
                    groupId={groupId}
                    memberId={member.userId}
                    memberName={member.name}
                    currentUserId={session.userId}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Settlements */}
          {hasOutstandingBalance && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                Settle up
              </h2>
              <div className="space-y-2">
                {balances!.transfers.map((t, i) => {
                  const fromName = t.from.name ?? memberName(t.from.userId);
                  const toName = t.to.name ?? memberName(t.to.userId);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5"
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs">
                          <span className="font-medium">{fromName}</span>
                          <span className="mx-1 text-muted-foreground">owes</span>
                          <span className="font-medium">{toName}</span>
                        </p>
                        <p className="text-sm font-semibold text-destructive tabular-nums">
                          {formatAmount(t.amount.amount, t.amount.currency)}
                        </p>
                      </div>
                      <RecordSettlementButton
                        groupId={groupId}
                        fromUserId={t.from.userId}
                        toUserId={t.to.userId}
                        fromName={fromName}
                        toName={toName}
                        amount={t.amount.amount}
                        currency={t.amount.currency}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
