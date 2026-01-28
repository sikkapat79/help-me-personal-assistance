import { listUserProfiles } from '@/lib/features/profile/use-cases/listUserProfiles';
import { ProfileList } from './_components/ProfileList';
import { CreateProfileForm } from './_components/CreateProfileForm';

export const dynamic = 'force-dynamic';

export default async function SelectProfilePage() {
  const profilesResult = await listUserProfiles();

  const profiles = profilesResult.ok
    ? profilesResult.data.map((profile) => ({
        id: profile.id,
        displayName: profile.displayName,
        role: profile.role,
        bio: profile.bio,
        workingStartMinutes: profile.workingStartMinutes,
        workingEndMinutes: profile.workingEndMinutes,
        primaryFocusPeriod: profile.primaryFocusPeriod,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }))
    : [];

  return (
    <div id='select-profile-page' className='container mx-auto max-w-4xl p-6'>
      <div className='space-y-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-zinc-900 dark:text-zinc-50'>
            Welcome to HelpMe
          </h1>
          <p className='mt-3 text-lg text-zinc-600 dark:text-zinc-400'>
            Select a profile to continue, or create a new one
          </p>
        </div>

        {profiles.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-50'>
              Existing Profiles
            </h2>
            <ProfileList profiles={profiles} />
          </div>
        )}

        <div className='space-y-4'>
          <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-50'>
            Create New Profile
          </h2>
          <CreateProfileForm />
        </div>
      </div>
    </div>
  );
}
