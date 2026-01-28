import { AppTopNav } from '@/components/AppTopNav';
import { getActiveProfileIdFromCookies } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Optionally get profile info for nav (safe, no redirect)
  let profileName: string | null = null;
  const profileId = await getActiveProfileIdFromCookies();
  if (profileId) {
    const profileResult = await getUserProfileById(profileId);
    if (profileResult.ok) {
      profileName = profileResult.data.displayName;
    }
  }

  return (
    <div id='app-layout' className='min-h-screen bg-background'>
      <AppTopNav profileName={profileName} />
      <main className='container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
        {children}
      </main>
    </div>
  );
}
