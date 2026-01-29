import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { listAllTasksForOwner } from '@/lib/features/tasks/use-cases/listAllTasksForOwner';
import type { TaskData } from '@/lib/features/tasks/types';
import { AllTasksList } from '@/components/AllTasksList';
import {
  TasksViewToggle,
  type TasksView,
} from '@/components/TasksViewToggle';
import { TasksCalendarView } from '@/components/TasksCalendarView';
import { NoDateSection } from '@/components/NoDateSection';

export const dynamic = 'force-dynamic';

export default async function TasksPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ view?: string }>;
}>) {
  const profileId = await requireActiveProfileId();
  const tasks = await listAllTasksForOwner(profileId);
  const params = await searchParams;
  const view: TasksView =
    params?.view === 'calendar' ? 'calendar' : 'list';

  const plainTasks: TaskData[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    intensity: task.intensity,
    dueAt: task.dueAt,
    tags: task.tags,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt ?? null,
  }));

  const tasksWithDue = plainTasks.filter((t) => t.dueAt != null);
  const tasksNoDate = plainTasks.filter((t) => t.dueAt == null);

  return (
    <div id='tasks-page' className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-foreground'>All tasks</h1>
        <p className='mt-1 text-muted-foreground'>
          View and manage all your tasks, sorted by deadline
        </p>
      </div>

      <TasksViewToggle currentView={view} />

      {view === 'list' ? (
        <AllTasksList tasks={plainTasks} />
      ) : (
        <div className='space-y-6'>
          <TasksCalendarView tasks={tasksWithDue} />
          <NoDateSection tasks={tasksNoDate} />
        </div>
      )}
    </div>
  );
}
