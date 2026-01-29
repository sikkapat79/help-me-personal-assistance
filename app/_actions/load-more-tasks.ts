'use server';

import {
  listTasksCursor,
  type ListTasksCursor,
} from '@/lib/features/tasks/use-cases/listTasksCursor';
import { taskToTaskData } from '@/lib/features/tasks/mappers';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';

export type LoadMoreTasksResult = {
  ok: true;
  tasks: Awaited<ReturnType<typeof taskToTaskData>>[];
  nextCursor: ListTasksCursor | null;
};

export async function loadMoreTasksAction(
  cursor: ListTasksCursor | null,
): Promise<LoadMoreTasksResult> {
  const ownerId = await requireActiveProfileId();
  const { tasks, nextCursor } = await listTasksCursor(ownerId, cursor);
  const plain = tasks.map(taskToTaskData);
  return { ok: true, tasks: plain, nextCursor };
}
