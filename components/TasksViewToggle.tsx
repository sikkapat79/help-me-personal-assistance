'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type TasksView = 'list' | 'calendar';

const viewLinks: { view: TasksView; label: string }[] = [
  { view: 'list', label: 'List' },
  { view: 'calendar', label: 'Calendar' },
];

export function TasksViewToggle({
  currentView,
}: Readonly<{ currentView: TasksView }>) {
  return (
    <div
      role='tablist'
      aria-label='Tasks view'
      className='flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900'
    >
      {viewLinks.map(({ view, label }) => {
        const href =
          view === 'calendar'
            ? '/tasks?view=calendar&calendarView=week'
            : '/tasks?view=list';
        const active = currentView === view;
        return (
          <Link
            key={view}
            href={href}
            role='tab'
            aria-selected={active}
            id={`tasks-view-${view}`}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
