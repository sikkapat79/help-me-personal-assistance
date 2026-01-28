import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { CalibrationForm } from './_components/CalibrationForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CalibrationPage() {
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);

  if (!profileResult.ok) {
    // If profile not found, redirect to select profile
    redirect('/select-profile');
  }

  const profile = profileResult.data;

  // Convert entity to plain object for client component
  const profileData = {
    id: profile.id,
    displayName: profile.displayName,
    role: profile.role,
    bio: profile.bio,
    workingStartMinutes: profile.workingStartMinutes,
    workingEndMinutes: profile.workingEndMinutes,
    primaryFocusPeriod: profile.primaryFocusPeriod,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  return (
    <div id='calibration-page' className='container mx-auto max-w-4xl p-6'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold text-zinc-900 dark:text-zinc-50'>
            Calibration
          </h1>
          <p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
            Configure your profile and working preferences
          </p>
        </div>

        <CalibrationForm profile={profileData} />
      </div>
    </div>
  );
}
