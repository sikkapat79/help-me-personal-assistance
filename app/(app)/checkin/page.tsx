import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { MorningCheckInForm } from './_components/MorningCheckInForm';
import { DailyCheckInData } from '@/lib/features/checkin/types';
import { getYyyyMmDdInTimeZone } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function CheckInPage() {
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);

  // Get today's date in the user's timezone
  const profile = profileResult.ok ? profileResult.data : null;
  const timeZone = profile?.timeZone ?? 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);

  // Fetch existing check-in for today (if any)
  const checkInResult = await getDailyCheckInForDate(profileId, today);

  let existingCheckIn: DailyCheckInData | null = null;

  if (checkInResult.ok && checkInResult.data) {
    // Convert entity to plain object for client component
    existingCheckIn = {
      id: checkInResult.data.id,
      checkInDate: checkInResult.data.checkInDate,
      restQuality1to10: checkInResult.data.restQuality1to10,
      morningMood: checkInResult.data.morningMood,
      energyBudget: checkInResult.data.energyBudget,
      createdAt: checkInResult.data.createdAt,
      updatedAt: checkInResult.data.updatedAt,
    };
  }

  return (
    <div id='checkin-page' className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Morning Check-in</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          Set your energy plan for today based on your rest and mood
        </p>
      </div>

      <MorningCheckInForm
        existingCheckIn={existingCheckIn}
        checkInDate={today}
      />
    </div>
  );
}
