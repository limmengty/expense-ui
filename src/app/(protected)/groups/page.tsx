import { GroupList } from '@/features/groups/components/group-list';
import { CreateGroupDialog } from '@/features/groups/components/create-group-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageLayout, PageHeader, PageSection } from '@/components/layout/page-layout';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import { getSession } from '@/features/auth/actions';
import type { GroupDTO, GroupBalances } from '@/features/groups/api';

async function getGroupsData() {
  try {
    return await api.get<GroupDTO[]>(API_ENDPOINTS.GROUPS);
  } catch {
    return [] as GroupDTO[];
  }
}

async function getBalancesForGroups(groups: GroupDTO[], currentUserId: string) {
  const results = new Map<string, { amount: number; currency: string }>();
  await Promise.allSettled(
    groups.map(async (group) => {
      try {
        const balances = await api.get<GroupBalances>(API_ENDPOINTS.GROUP_BALANCES(group.id));
        const transfers = balances?.transfers ?? [];
        if (transfers.length === 0) {
          results.set(group.id, { amount: 0, currency: 'USD' });
        } else {
          let net = 0;
          let currency = 'USD';
          for (const t of transfers) {
            currency = t.amount.currency;
            if (t.to.userId === currentUserId) {
              net += t.amount.amount;
            } else if (t.from.userId === currentUserId) {
              net -= t.amount.amount;
            }
          }
          results.set(group.id, { amount: net, currency });
        }
      } catch {
        results.set(group.id, { amount: 0, currency: 'USD' });
      }
    })
  );
  return results;
}

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) return null;

  const groups = await getGroupsData();
  const balances = await getBalancesForGroups(groups, session.userId);

  return (
    <PageLayout maxWidth="6xl">
      <PageHeader
        title="Groups"
        description={
          groups.length === 0
            ? 'Create your first group to get started'
            : `${groups.length} group${groups.length !== 1 ? 's' : ''}`
        }
        actions={
          <CreateGroupDialog>
            <Button>
              <Plus className="h-4 w-4" />
              New group
            </Button>
          </CreateGroupDialog>
        }
      />

      <PageSection index={0}>
        <GroupList groups={groups} balances={balances} currentUserId={session.userId} />
      </PageSection>
    </PageLayout>
  );
}
