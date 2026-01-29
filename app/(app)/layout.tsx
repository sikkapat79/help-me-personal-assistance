import { AppTopNav } from '@/components/AppTopNav';
import { getActiveProfileIdFromCookies } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getDailyCheckInForDate } from '@/lib/features/checkin/use-cases/getDailyCheckInForDate';
import { getYyyyMmDdInTimeZone } from '@/lib/time';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Optionally get profile info for nav (safe, no redirect)
  let profileName: string | null = null;
  let energyBudget: number | null = null;
  const profileId = await getActiveProfileIdFromCookies();
  if (profileId) {
    const profileResult = await getUserProfileById(profileId);
    if (profileResult.ok) {
      profileName = profileResult.data.displayName;
      // Get today's check-in for energy budget
      const timeZone = profileResult.data.timeZone ?? 'UTC';
      const today = getYyyyMmDdInTimeZone(timeZone);
      const checkInResult = await getDailyCheckInForDate(profileId, today);
      if (checkInResult.ok && checkInResult.data) {
        energyBudget = checkInResult.data.energyBudget;
      }
    }
  }

  return (
    <div id='app-layout' className='min-h-screen bg-background'>
      <AppTopNav profileName={profileName} energyBudget={energyBudget} />
      <main className='container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
        {children}
      </main>
    </div>
  );
}
