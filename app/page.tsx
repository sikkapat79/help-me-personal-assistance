import { TaskCreateModal } from '@/components/TaskCreateModal';
import { TaskList } from '@/components/TaskList';
import { LogoutButton } from '@/components/LogoutButton';
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
    <main className='min-h-screen p-8' id='home-page'>
      <div className='max-w-4xl mx-auto'>
        <header
          className='flex justify-between items-center mb-8'
          id='page-header'
        >
          <div>
            <h1 className='text-3xl font-bold'>Welcome back, {profileName}.</h1>
            <p className='text-zinc-600 dark:text-zinc-400 mt-1'>
              Your tasks for today
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <LogoutButton />
            <TaskCreateModal />
          </div>
        </header>

        <TaskList />
      </div>
    </main>
  );
}
