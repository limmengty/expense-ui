import type { Metadata } from 'next';
import Link from 'next/link';
import { ExpenseTable } from '@/features/expenses/components/expense-table';
import { ExpenseFilters } from '@/features/expenses/components/expense-filters';
import { AddExpenseDialog } from '@/features/expenses/components/add-expense-dialog';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageLayout, PageHeader, PageSection } from '@/components/layout/page-layout';
import { getSession } from '@/features/auth/actions';
import { getExpenses } from '@/features/expenses/api';
import type { GroupDTO, GroupMemberDTO } from '@/features/groups/api';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';

export const metadata: Metadata = { title: 'Expenses' };

interface Props {
  searchParams: Promise<{
    group?: string;
    status?: string;
    page?: string;
    q?: string;
  }>;
}

async function getGroups() {
  try {
    return await api.get<GroupDTO[]>(API_ENDPOINTS.GROUPS);
  } catch {
    return [] as GroupDTO[];
  }
}

async function getMemberNames(groupIds: string[]): Promise<Record<string, string>> {
  if (groupIds.length === 0) return {};
  const results = await Promise.allSettled(
    groupIds.map((id) => api.get<GroupMemberDTO[]>(API_ENDPOINTS.GROUP_MEMBERS(id)))
  );
  const map: Record<string, string> = {};
  results.forEach((r) => {
    if (r.status === 'fulfilled') {
      r.value.forEach((m) => {
        if (!map[m.userId]) map[m.userId] = m.name;
      });
    }
  });
  return map;
}

export default async function ExpensesPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;

  const resolved = await searchParams;
  const groupId = resolved.group && resolved.group !== 'all' ? resolved.group : undefined;
  const settled =
    resolved.status && resolved.status !== 'all' ? resolved.status === 'settled' : undefined;
  const page = resolved.page ? parseInt(resolved.page, 10) : 0;
  const searchQuery = resolved.q ?? '';

  const [expensesData, groups] = await Promise.all([
    getExpenses({ groupId, settled, page, size: 50, sort: 'createdAt,desc' }).catch(() => null),
    getGroups(),
  ]);

  const expenses = expensesData?.content ?? [];
  const groupOptions = groups.map((g) => ({ id: g.id, name: g.name }));
  const totalPages = expensesData?.totalPages ?? 1;
  const totalElements = expensesData?.totalElements ?? 0;

  // Resolve member names only for groups appearing in this page's results
  const uniqueGroupIds = [...new Set(expenses.map((e) => e.groupId))];
  const memberNames = await getMemberNames(uniqueGroupIds);

  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (resolved.group && resolved.group !== 'all') params.set('group', resolved.group);
    if (resolved.status && resolved.status !== 'all') params.set('status', resolved.status);
    if (resolved.q) params.set('q', resolved.q);
    if (targetPage > 0) params.set('page', String(targetPage));
    const qs = params.toString();
    return `/expenses${qs ? `?${qs}` : ''}`;
  }

  return (
    <PageLayout maxWidth="6xl">
      <PageHeader
        title="Expenses"
        description={
          totalElements > 0
            ? `${totalElements} expense${totalElements !== 1 ? 's' : ''}`
            : 'Track and manage your shared expenses'
        }
        actions={
          <AddExpenseDialog groups={groupOptions}>
            <Button>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </AddExpenseDialog>
        }
      />

      <PageSection index={0}>
        <ExpenseFilters groups={groupOptions} />
      </PageSection>

      <PageSection index={1} className="pt-4">
        <ExpenseTable
          expenses={expenses}
          isLoading={false}
          groups={groupOptions}
          searchQuery={searchQuery}
          memberNames={memberNames}
        />
      </PageSection>

      {totalPages > 1 && (
        <PageSection index={2} className="pt-4">
          <div className="flex items-center justify-center gap-3">
            {page > 0 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageUrl(page - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            {!expensesData?.last ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPageUrl(page + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </PageSection>
      )}
    </PageLayout>
  );
}
