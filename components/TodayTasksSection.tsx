'use client';

import { ReprioritizeTodayButton } from '@/components/ReprioritizeTodayButton';

interface TodayTasksSectionProps {
  hasCheckInToday: boolean;
  children: React.ReactNode;
}

export function TodayTasksSection({
  hasCheckInToday,
  children,
}: Readonly<TodayTasksSectionProps>) {
  return (
    <section id='today-tasks-section' className='space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <h2 className='text-lg font-semibold text-foreground'>
          Today&apos;s tasks
        </h2>
        <ReprioritizeTodayButton show={hasCheckInToday} />
      </div>
      {children}
    </section>
  );
}
