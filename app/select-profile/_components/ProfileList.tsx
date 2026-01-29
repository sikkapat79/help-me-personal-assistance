'use client';

import React, { useTransition } from 'react';
import { selectProfileAction } from '@/app/_actions/select-profile';
import {
  UserProfileData,
  formatTimeFromMinutes,
} from '@/lib/features/profile/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';

interface ProfileListProps {
  readonly profiles: UserProfileData[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const toast = useToast();

  const handleSelect = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    setSelectedId(profileId);
    startTransition(async () => {
      const result = await selectProfileAction(profileId);
      if (result.ok) {
        toast.success('Profile selected', {
          description: `Switched to ${profile?.displayName || 'profile'}.`,
        });
      } else {
        toast.error('Failed to select profile', {
          description: result.error?.message || 'Could not switch profiles.',
        });
      }
    });
  };

  return (
    <div id='profile-list' className='grid gap-4 md:grid-cols-2'>
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className='rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md'
        >
          <h3 className='text-lg font-semibold text-card-foreground'>
            {profile.displayName}
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>{profile.role}</p>
          {profile.bio && (
            <p className='mt-2 text-sm text-muted-foreground line-clamp-2'>
              {profile.bio}
            </p>
          )}
          <div className='mt-3 text-xs text-muted-foreground'>
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
            loading={isPending && selectedId === profile.id}
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
