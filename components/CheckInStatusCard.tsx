import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DailyCheckInData } from '@/lib/features/checkin/types';

interface CheckInStatusCardProps {
  readonly checkIn: DailyCheckInData | null;
}

export function CheckInStatusCard({ checkIn }: CheckInStatusCardProps) {
  if (!checkIn) {
    // No check-in for today
    return (
      <div
        id='checkin-status-card'
        className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
              Morning Check-in
            </h3>
            <p className='mt-1 text-sm text-amber-700 dark:text-amber-300'>
              You haven&apos;t checked in today yet. Set your energy plan to get started.
            </p>
          </div>
          <Link href='/checkin'>
            <Button size='sm' variant='default'>
              Check In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check-in exists for today
  return (
    <div
      id='checkin-status-card'
      className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950'
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-green-900 dark:text-green-100'>
            Morning Check-in Complete
          </h3>
          <div className='mt-2 flex items-center gap-4 text-sm text-green-700 dark:text-green-300'>
            <div>
              <span className='font-medium'>Quality:</span> {checkIn.restQuality1to10}/10
            </div>
            <div>
              <span className='font-medium'>Mood:</span> {checkIn.morningMood}
            </div>
            <div className='rounded-md bg-green-100 px-2 py-1 dark:bg-green-900'>
              <span className='font-medium'>Energy:</span> {checkIn.energyBudget}
            </div>
          </div>
        </div>
        <Link href='/checkin'>
          <Button size='sm' variant='outline'>
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
}
