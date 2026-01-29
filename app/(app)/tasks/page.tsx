import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { listTasksCursor } from '@/lib/features/tasks/use-cases/listTasksCursor';
import { listTasksInDateRange } from '@/lib/features/tasks/use-cases/listTasksInDateRange';
import { listTasksUndated } from '@/lib/features/tasks/use-cases/listTasksUndated';
import { taskToTaskData } from '@/lib/features/tasks/mappers';
import type { TaskData } from '@/lib/features/tasks/types';
import {
  getYyyyMmDdInTimeZone,
  getWeekStartEndInTimeZone,
  getMonthStartEndInTimeZone,
} from '@/lib/time';
import type { ListTasksCursor } from '@/lib/features/tasks/use-cases/listTasksCursor';
import { AllTasksList } from '@/components/AllTasksList';
import { TasksViewToggle, type TasksView } from '@/components/TasksViewToggle';
import { TasksCalendarView } from '@/components/TasksCalendarView';
import { NoDateSection } from '@/components/NoDateSection';

export const dynamic = 'force-dynamic';

export type CalendarViewMode = 'week' | 'month';

export default async function TasksPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    view?: string;
    calendarDate?: string;
    calendarView?: string;
  }>;
}>) {
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const todayYyyyMmDd = getYyyyMmDdInTimeZone(timeZone);

  const params = await searchParams;
  const view: TasksView = params?.view === 'calendar' ? 'calendar' : 'list';
  const calendarView: CalendarViewMode =
    params?.calendarView === 'month' ? 'month' : 'week';
  const calendarDate = params?.calendarDate ?? todayYyyyMmDd;

  let initialTasks: TaskData[] = [];
  let nextCursor: ListTasksCursor | null = null;
  let tasksWithDue: TaskData[] = [];
  let tasksNoDate: TaskData[] = [];

  if (view === 'list') {
    const result = await listTasksCursor(profileId, null);
    initialTasks = result.tasks.map(taskToTaskData);
    nextCursor = result.nextCursor;
  } else {
    const { start, end } =
      calendarView === 'month'
        ? getMonthStartEndInTimeZone(timeZone, calendarDate)
        : getWeekStartEndInTimeZone(timeZone, calendarDate);
    const [rangeTasks, undatedTasks] = await Promise.all([
      listTasksInDateRange(profileId, start, end),
      listTasksUndated(profileId),
    ]);
    tasksWithDue = rangeTasks.map(taskToTaskData);
    tasksNoDate = undatedTasks.map(taskToTaskData);
  }

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
        <AllTasksList initialTasks={initialTasks} nextCursor={nextCursor} />
      ) : (
        <div className='space-y-6'>
          <TasksCalendarView
            tasks={tasksWithDue}
            initialDate={calendarDate}
            initialView={calendarView}
          />
          <NoDateSection tasks={tasksNoDate} />
        </div>
      )}
    </div>
  );
}
