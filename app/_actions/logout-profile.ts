'use server';

import { redirect } from 'next/navigation';

import { clearActiveProfileIdCookie } from '@/lib/features/profile/activeProfile';

export async function logoutProfileAction(): Promise<void> {
  await clearActiveProfileIdCookie();
  redirect('/select-profile');
}
