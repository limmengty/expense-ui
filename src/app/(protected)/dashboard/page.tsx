import { SummaryCards } from '@/features/dashboard/components/summary-cards';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { SettleUpPanel } from '@/features/dashboard/components/settle-up-panel';
import { SpendingHistoryChart } from '@/features/dashboard/components/spending-history-chart';
import { AddExpenseDialog } from '@/features/expenses/components/add-expense-dialog';
import { PageLayout, PageHeader, PageSection } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import { getSession } from '@/features/auth/actions';
import type { DashboardSummaryDTO, RecentActivityDTO, BalanceDTO } from '@/types';
import type { GroupDTO } from '@/features/groups/api';

async function getDashboardData() {
  try {
    const [summary, recentActivity, balances, groups] = await Promise.all([
      api.get<DashboardSummaryDTO>(`${API_ENDPOINTS.DASHBOARD}/summary`).catch(() => ({
        totalGetBack: 0,
        totalYouOwe: 0,
        netBalance: 0,
        pendingSettlements: 0,
      })),
      api.get<RecentActivityDTO[]>(`${API_ENDPOINTS.DASHBOARD}/activity`).catch(() => []),
      api.get<BalanceDTO[]>(`${API_ENDPOINTS.DASHBOARD}/balances`).catch(() => []),
      api.get<GroupDTO[]>(API_ENDPOINTS.GROUPS).catch(() => []),
    ]);
    return { summary, recentActivity, balances, groups };
  } catch {
    return {
      summary: { totalGetBack: 0, totalYouOwe: 0, netBalance: 0, pendingSettlements: 0 },
      recentActivity: [] as RecentActivityDTO[],
      balances: [] as BalanceDTO[],
      groups: [] as GroupDTO[],
    };
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const { summary, recentActivity, balances, groups } = await getDashboardData();
  const groupOptions = groups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <PageLayout maxWidth="6xl">
      <PageHeader
        title="Dashboard"
        description="Your financial overview"
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
        <SummaryCards
          totalGetBack={summary.totalGetBack}
          totalYouOwe={summary.totalYouOwe}
          pendingSettlements={summary.pendingSettlements}
        />
      </PageSection>

      {/* Two-column: activity (wider) + settle-up (narrower) */}
      <PageSection index={1} className="pt-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentActivity activities={recentActivity} />
          </div>
          <div className="lg:col-span-2">
            <SettleUpPanel balances={balances} currentUserId={session.userId} />
          </div>
        </div>
      </PageSection>

      <PageSection index={2} className="pt-6">
        <SpendingHistoryChart />
      </PageSection>
    </PageLayout>
  );
}
