'use server';

import { revalidatePath } from 'next/cache';
import {
  createGroup as createGroupApi,
  addGroupMember,
  removeGroupMember,
  renameGroup,
  getGroups,
  getGroupMembers,
} from '@/features/groups/api';
import { createGroupSchema } from '@/features/expenses/schemas';

export async function getGroupsAction() {
  return getGroups();
}

export async function getGroupMembersAction(groupId: string) {
  return getGroupMembers(groupId);
}

export async function createGroupAction(formData: unknown) {
  const parsed = createGroupSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const group = await createGroupApi({ name: parsed.data.name, initialMembers: [] });
    revalidatePath('/groups');
    return { success: true, data: group };
  } catch (error) {
    console.error('Failed to create group:', error);
    return {
      success: false,
      errors: { _form: ['Failed to create group. Please try again.'] },
    };
  }
}

export async function addGroupMemberAction(groupId: string, userId: string) {
  try {
    await addGroupMember(groupId, userId);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add member:', error);
    return {
      success: false,
      errors: { _form: ['Failed to add member. Please try again.'] },
    };
  }
}

export async function removeGroupMemberAction(groupId: string, userId: string) {
  try {
    await removeGroupMember(groupId, userId);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove member:', error);
    return {
      success: false,
      errors: { _form: ['Failed to remove member. Please try again.'] },
    };
  }
}

export async function renameGroupAction(groupId: string, newName: string) {
  try {
    await renameGroup(groupId, newName);
    revalidatePath(`/groups/${groupId}`);
    revalidatePath('/groups');
    return { success: true };
  } catch (error) {
    console.error('Failed to rename group:', error);
    return {
      success: false,
      errors: { _form: ['Failed to rename group. Please try again.'] },
    };
  }
}
