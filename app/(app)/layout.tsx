import { Suspense } from 'react';
import { AppTopNav } from '@/components/AppTopNav';
import { TransitionDirectionHandler } from '@/components/TransitionDirectionHandler';
import { getActiveProfileIdFromCookies } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getRemainingEnergyForDate } from '@/lib/features/checkin/use-cases/getRemainingEnergyForDate';
import { getYyyyMmDdInTimeZone } from '@/lib/time';
import AppLoading from './loading';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let profileName: string | null = null;
  let energyBudget: number | null = null;
  let remainingEnergy: number | null = null;
  const profileId = await getActiveProfileIdFromCookies();
  if (profileId) {
    const profileResult = await getUserProfileById(profileId);
    if (profileResult.ok) {
      profileName = profileResult.data.displayName;
      const timeZone = profileResult.data.timeZone ?? 'UTC';
      const today = getYyyyMmDdInTimeZone(timeZone);
      const remainingResult = await getRemainingEnergyForDate(profileId, today);
      if (remainingResult.ok && remainingResult.data.energyBudget > 0) {
        energyBudget = remainingResult.data.energyBudget;
        remainingEnergy = remainingResult.data.remaining;
      }
    }
  }

  return (
    <div id='app-layout' className='min-h-screen bg-background'>
      <TransitionDirectionHandler />
      <AppTopNav
        profileName={profileName}
        energyBudget={energyBudget}
        remainingEnergy={remainingEnergy}
      />
      <main className='container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
        <Suspense fallback={<AppLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}
