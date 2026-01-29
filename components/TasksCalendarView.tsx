'use client';

import { useState, useMemo } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import dayjs from 'dayjs';
import type { TaskData } from '@/lib/features/tasks/types';
import { TaskFormModal } from './TaskFormModal';
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

export function TasksCalendarView({ tasks }: Readonly<{ tasks: TaskData[] }>) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(() => new Date());
  const [editTask, setEditTask] = useState<TaskData | null>(null);

  const events = useMemo(() => tasksToEvents(tasks), [tasks]);

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
          onView={setView}
          date={date}
          onNavigate={setDate}
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
