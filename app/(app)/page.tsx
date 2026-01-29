import dayjs from 'dayjs';
import { TaskList } from '@/components/TaskList';
import { TodayTasksSection } from '@/components/TodayTasksSection';
import { DonePanel } from '@/components/DonePanel';
import { CheckInStatusCard } from '@/components/CheckInStatusCard';
import { DailyPlanCard } from '@/components/DailyPlanCard';
import { YesterdaySummaryCard } from '@/components/YesterdaySummaryCard';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { DailyCheckInData } from '@/lib/features/checkin/types';
import {
  getYyyyMmDdInTimeZone,
  getMinutesSinceMidnightInTimeZone,
} from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Require active profile, redirects to /select-profile if missing
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);

  const profileName = profileResult.ok
    ? profileResult.data.displayName
    : 'User';

  // Get today's date in the user's timezone
  const profile = profileResult.ok ? profileResult.data : null;
  const timeZone = profile?.timeZone ?? 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);
  const yesterday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');

  const [checkInResult, yesterdayCheckInResult] = await Promise.all([
    getDailyCheckInForDate(profileId, today),
    getDailyCheckInForDate(profileId, yesterday),
  ]);

  // Check if it's past the poke time (only show reminder after 08:00 local time)
  const isPastPokeTime =
    profile &&
    getMinutesSinceMidnightInTimeZone(timeZone) >=
      profile.morningPokeTimeMinutes;

  let todayCheckIn: DailyCheckInData | null = null;
  if (checkInResult.ok && checkInResult.data) {
    todayCheckIn = {
      id: checkInResult.data.id,
      checkInDate: checkInResult.data.checkInDate,
      restQuality1to10: checkInResult.data.restQuality1to10,
      morningMood: checkInResult.data.morningMood,
      energyBudget: checkInResult.data.energyBudget,
      sleepNotes: checkInResult.data.sleepNotes ?? null,
      eveningSummary: checkInResult.data.eveningSummary ?? null,
      createdAt: checkInResult.data.createdAt,
      updatedAt: checkInResult.data.updatedAt,
    };
  }

  const yesterdayCheckIn =
    yesterdayCheckInResult.ok && yesterdayCheckInResult.data
      ? yesterdayCheckInResult.data
      : null;
  const yesterdaySummary = yesterdayCheckIn?.eveningSummary?.trim() ?? null;
  const showFallbackButton =
    !!yesterdayCheckIn &&
    (yesterdayCheckIn.eveningSummary == null ||
      yesterdayCheckIn.eveningSummary.trim() === '');

  return (
    <div id='home-page' className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-foreground'>
          Welcome back, {profileName}.
        </h1>
        <p className='text-muted-foreground mt-1'>Your tasks for today</p>
      </div>

      <CheckInStatusCard
        checkIn={todayCheckIn}
        shouldShowReminder={isPastPokeTime ?? false}
      />

      <YesterdaySummaryCard
        yesterdaySummary={yesterdaySummary}
        yesterdayYyyyMmDd={yesterday}
        showFallbackButton={showFallbackButton}
      />

      <DailyPlanCard />

      <TodayTasksSection hasCheckInToday={!!todayCheckIn}>
        <TaskList />
      </TodayTasksSection>

      <DonePanel />
    </div>
  );
}
