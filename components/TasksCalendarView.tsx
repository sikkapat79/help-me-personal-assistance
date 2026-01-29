'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import dayjs from 'dayjs';
import type { TaskData } from '@/lib/features/tasks/types';
import { TaskFormModal } from './TaskFormModal';
import type { CalendarViewMode } from '@/app/(app)/tasks/page';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dayjsLocalizer(dayjs);

type CalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  allDay: false;
  resource: TaskData;
};

function toDate(val: Date | string | null): Date | null {
  if (val == null) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

const DEFAULT_EVENT_MINUTES = 60;

function tasksToEvents(tasks: TaskData[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const task of tasks) {
    const d = toDate(task.dueAt);
    if (!d) continue;
    const start = dayjs(d).toDate();
    const end = dayjs(d).add(DEFAULT_EVENT_MINUTES, 'minute').toDate();
    out.push({
      start,
      end,
      title: task.title,
      allDay: false,
      resource: task,
    });
  }
  return out;
}

export function TasksCalendarView({
  tasks,
  initialDate,
  initialView,
}: Readonly<{
  tasks: TaskData[];
  initialDate: string;
  initialView: CalendarViewMode;
}>) {
  const router = useRouter();
  const [editTask, setEditTask] = useState<TaskData | null>(null);
  const view: View = initialView === 'month' ? 'month' : 'week';
  const date = useMemo(
    () =>
      dayjs(initialDate).isValid() ? dayjs(initialDate).toDate() : new Date(),
    [initialDate],
  );

  const events = useMemo(() => tasksToEvents(tasks), [tasks]);

  const handleNavigate = (d: Date) => {
    const next = dayjs(d).format('YYYY-MM-DD');
    router.push(
      `/tasks?view=calendar&calendarDate=${next}&calendarView=${initialView}`,
    );
  };

  const handleView = (v: View) => {
    const nextView: CalendarViewMode = v === 'month' ? 'month' : 'week';
    router.push(
      `/tasks?view=calendar&calendarDate=${initialDate}&calendarView=${nextView}`,
    );
  };

  return (
    <>
      <TaskFormModal
        open={editTask != null}
        onOpenChange={(open) => !open && setEditTask(null)}
        mode='edit'
        task={editTask ?? undefined}
      />
      <div className='min-h-[24rem] h-[32rem] rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={handleView}
          date={date}
          onNavigate={handleNavigate}
          views={['month', 'week']}
          startAccessor='start'
          endAccessor='end'
          titleAccessor='title'
          allDayAccessor='allDay'
          onSelectEvent={(evt: CalendarEvent) => setEditTask(evt.resource)}
        />
      </div>
    </>
  );
}
