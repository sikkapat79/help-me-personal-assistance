import Link from 'next/link';

import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getYyyyMmDdInTimeZone } from '@/lib/time';
import { getDailyPlanForDate } from '@/lib/features/plan/use-cases/getDailyPlanForDate';
import { toDailyPlanData } from '@/lib/features/plan/types';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { Button } from '@/components/ui/button';

export async function DailyPlanCard() {
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);

  if (!profileResult.ok) {
    return null;
  }

  const profile = profileResult.data;
  const timeZone = profile.timeZone ?? 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);

  const [planResult, checkInResult] = await Promise.all([
    getDailyPlanForDate(profileId, today),
    getDailyCheckInForDate(profileId, today),
  ]);

  if (!checkInResult.ok || !checkInResult.data) {
    // No check-in yet; let CheckInStatusCard drive the CTA.
    return null;
  }

  if (!planResult.ok) {
    // Plan fetch failure: surface a soft warning.
    return (
      <div
        id='daily-plan-card'
        className='rounded-lg border border-amber-200 bg-amber-50 p-4 transition-shadow hover:shadow-md dark:border-amber-900 dark:bg-amber-950'
      >
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
              Daily Plan
            </h3>
            <p className='mt-1 text-sm text-amber-700 dark:text-amber-300'>
              Your check-in is saved, but we couldn&apos;t load today&apos;s
              recommended plan. Tasks will fall back to simple due-date
              ordering.
            </p>
          </div>
          <Link href='/checkin'>
            <Button size='sm' variant='outline'>
              Adjust Check-in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const planEntity = planResult.data;

  if (!planEntity || planEntity.rankedTaskIds.length === 0) {
    return (
      <div
        id='daily-plan-card'
        className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900'
      >
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
              Daily Plan
            </h3>
            <p className='mt-1 text-sm text-slate-700 dark:text-slate-300'>
              You&apos;ve checked in for today. Once you add tasks, we&apos;ll
              suggest a simple, energy-aware order here.
            </p>
          </div>
          <Link href='/checkin'>
            <Button size='sm' variant='outline'>
              Review Check-in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const plan = toDailyPlanData(planEntity);

  return (
    <div
      id='daily-plan-card'
      className='rounded-lg border border-blue-200 bg-blue-50 p-4 transition-shadow hover:shadow-md dark:border-blue-900 dark:bg-blue-950'
    >
      <div className='flex flex-col gap-3'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
              Recommended order for today
            </h3>
            <p className='mt-1 text-sm text-blue-800 dark:text-blue-200'>
              Based on your morning check-in and today&apos;s energy budget (
              <span className='font-semibold'>{plan.energyBudget} points</span>
              ).
            </p>
          </div>
          <Link href='/checkin'>
            <Button size='sm' variant='outline'>
              Adjust Check-in
            </Button>
          </Link>
        </div>

        {plan.reasoningSummary ? (
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            {plan.reasoningSummary}
          </p>
        ) : (
          <p className='text-xs text-blue-800/80 dark:text-blue-200/80'>
            This ordering is deterministic and energy-aware (algorithm{' '}
            {plan.algorithmVersion}). Use it as guidance — you&apos;re always in
            control.
          </p>
        )}
      </div>
    </div>
  );
}
