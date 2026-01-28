'use client';

import React, { useTransition } from 'react';
import { selectProfileAction } from '@/app/_actions/select-profile';
import {
  UserProfileData,
  formatTimeFromMinutes,
} from '@/lib/features/profile/types';
import { Button } from '@/components/ui/button';

interface ProfileListProps {
  profiles: UserProfileData[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = (profileId: string) => {
    setSelectedId(profileId);
    startTransition(async () => {
      await selectProfileAction(profileId);
    });
  };

  return (
    <div id='profile-list' className='grid gap-4 md:grid-cols-2'>
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700'
        >
          <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
            {profile.displayName}
          </h3>
          <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
            {profile.role}
          </p>
          {profile.bio && (
            <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-500 line-clamp-2'>
              {profile.bio}
            </p>
          )}
          <div className='mt-3 text-xs text-zinc-500 dark:text-zinc-500'>
            <p>
              Working Hours:{' '}
              {formatTimeFromMinutes(profile.workingStartMinutes)} -{' '}
              {formatTimeFromMinutes(profile.workingEndMinutes)}
            </p>
            <p>Focus: {profile.primaryFocusPeriod}</p>
          </div>
          <Button
            id={`select-profile-${profile.id}-button`}
            onClick={() => handleSelect(profile.id)}
            disabled={isPending}
            className='mt-4 w-full'
            variant={selectedId === profile.id ? 'default' : 'outline'}
          >
            {isPending && selectedId === profile.id
              ? 'Selecting...'
              : 'Select Profile'}
          </Button>
        </div>
      ))}
    </div>
  );
}
