import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';

export interface GroupDTO {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  initialMembers?: string[];
}

export async function getGroups(): Promise<GroupDTO[]> {
  return api.get<GroupDTO[]>(API_ENDPOINTS.GROUPS);
}

export async function getGroupById(id: string): Promise<GroupDTO> {
  return api.get<GroupDTO>(API_ENDPOINTS.GROUP_BY_ID(id));
}

export async function createGroup(data: CreateGroupPayload): Promise<GroupDTO> {
  return api.post<GroupDTO>(API_ENDPOINTS.GROUPS, data);
}

export async function addGroupMember(groupId: string, userId: string): Promise<GroupDTO> {
  return api.post<GroupDTO>(API_ENDPOINTS.GROUP_MEMBERS(groupId), { userId });
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.GROUP_REMOVE_MEMBER(groupId, userId));
}

export async function renameGroup(groupId: string, newName: string): Promise<GroupDTO> {
  return api.patch<GroupDTO>(API_ENDPOINTS.GROUP_BY_ID(groupId), { name: newName });
}

export interface GroupMemberDTO {
  userId: string;
  name: string;
  email: string | null;
}

export async function getGroupMembers(groupId: string): Promise<GroupMemberDTO[]> {
  return api.get<GroupMemberDTO[]>(API_ENDPOINTS.GROUP_MEMBERS(groupId));
}

export interface GroupBalances {
  groupId: string;
  calculatedAt: string;
  transfers: Array<{
    from: { userId: string; name: string | null };
    to: { userId: string; name: string | null };
    amount: { amount: number; currency: string };
  }>;
}

export async function getGroupBalances(groupId: string): Promise<GroupBalances> {
  return api.get<GroupBalances>(API_ENDPOINTS.GROUP_BALANCES(groupId));
}
