import { TaskList } from '@/components/TaskList';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Require active profile, redirects to /select-profile if missing
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);

  const profileName = profileResult.ok
    ? profileResult.data.displayName
    : 'User';

  return (
    <div id='home-page' className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-foreground'>
          Welcome back, {profileName}.
        </h1>
        <p className='text-muted-foreground mt-1'>Your tasks for today</p>
      </div>

      <TaskList />
    </div>
  );
}
