import { getRepository } from '@/lib/db/connection';
import { Task } from '@/lib/db/entities/Task';
import { TaskStatus } from '@/lib/features/tasks/schema';

const PAGE_SIZE = 20;
const SENTINEL = '9999-12-31T23:59:59.999Z';

export type ListTasksCursor = {
  dueAt: string | null;
  createdAt: string;
  id: string;
};

export type ListTasksCursorResult = {
  tasks: Task[];
  nextCursor: ListTasksCursor | null;
};

/**
 * Cursor-based pagination: tasks ordered by dueAt ASC NULLS LAST, createdAt DESC, id ASC.
 * Returns up to PAGE_SIZE tasks and nextCursor for "load more".
 */
export async function listTasksCursor(
  ownerId: string,
  cursor: ListTasksCursor | null,
): Promise<ListTasksCursorResult> {
  const taskRepo = await getRepository(Task);
  const qb = taskRepo
    .createQueryBuilder('task')
    .where('task.owner_id = :ownerId', { ownerId })
    .andWhere('task.status IN (:...statuses)', {
      statuses: [
        TaskStatus.Pending,
        TaskStatus.InProgress,
        TaskStatus.Completed,
      ],
    })
    .orderBy('task.due_at', 'ASC', 'NULLS LAST')
    .addOrderBy('task.created_at', 'DESC')
    .addOrderBy('task.id', 'ASC')
    .take(PAGE_SIZE + 1);

  if (cursor) {
    const dueAt = cursor.dueAt ?? SENTINEL;
    const createdAt = cursor.createdAt;
    const id = cursor.id;
    qb.andWhere(
      `(
        COALESCE(task.due_at, :sentinel::timestamptz) > COALESCE(:dueAt::timestamptz, :sentinel::timestamptz)
        OR (COALESCE(task.due_at, :sentinel::timestamptz) = COALESCE(:dueAt::timestamptz, :sentinel::timestamptz) AND task.created_at < :createdAt::timestamptz)
        OR (COALESCE(task.due_at, :sentinel::timestamptz) = COALESCE(:dueAt::timestamptz, :sentinel::timestamptz) AND task.created_at = :createdAt::timestamptz AND task.id > :id)
      )`,
      { sentinel: SENTINEL, dueAt, createdAt, id },
    );
  }

  const tasks = await qb.getMany();
  const hasMore = tasks.length > PAGE_SIZE;
  const page = hasMore ? tasks.slice(0, PAGE_SIZE) : tasks;
  const last = page.at(-1) ?? null;
  const nextCursor: ListTasksCursor | null =
    hasMore && last
      ? {
          dueAt: last.dueAt?.toISOString() ?? null,
          createdAt: last.createdAt.toISOString(),
          id: last.id,
        }
      : null;

  return { tasks: page, nextCursor };
}
