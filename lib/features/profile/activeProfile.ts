'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ACTIVE_PROFILE_COOKIE = 'activeProfileId';

/**
 * Get the active profile ID from cookies (if set)
 */
export async function getActiveProfileIdFromCookies(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  const activeProfileId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;
  return activeProfileId;
}

/**
 * Require an active profile ID from cookies, redirect to /select-profile if missing
 */
export async function requireActiveProfileId(): Promise<string> {
  const activeProfileId = await getActiveProfileIdFromCookies();
  if (!activeProfileId) {
    redirect('/select-profile');
  }
  return activeProfileId;
}

/**
 * Set the active profile ID cookie
 */
export async function setActiveProfileIdCookie(
  profileId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
}

/**
 * Clear the active profile ID cookie
 */
export async function clearActiveProfileIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_PROFILE_COOKIE);
}
