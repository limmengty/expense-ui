import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroups, getGroupById, createGroup } from '@/features/groups/api';
import type { CreateGroupDTO } from '@/types';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups(),
    staleTime: 60 * 1000,
  });
}

export function useGroupById(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupDTO) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
