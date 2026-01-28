'use client';

import React, { useActionState, useTransition } from 'react';
import { updateProfileAction } from '@/app/_actions/update-profile';
import { PrimaryFocusPeriod } from '@/lib/features/profile/schema';
import {
  UserProfileData,
  formatTimeFromMinutes,
} from '@/lib/features/profile/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CalibrationFormProps {
  profile: UserProfileData;
}

export function CalibrationForm({ profile }: CalibrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(updateProfileAction, null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Convert time inputs (HH:MM) to minutes since midnight
    const workingStartTime = formData.get('workingStartTime') as string;
    const workingEndTime = formData.get('workingEndTime') as string;

    if (workingStartTime) {
      const [startHours, startMinutes] = workingStartTime
        .split(':')
        .map(Number);
      formData.set(
        'workingStartMinutes',
        String(startHours * 60 + startMinutes),
      );
    }

    if (workingEndTime) {
      const [endHours, endMinutes] = workingEndTime.split(':').map(Number);
      formData.set('workingEndMinutes', String(endHours * 60 + endMinutes));
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div id='calibration-form' className='space-y-8'>
      {/* Bio & Identity Section */}
      <div className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-50'>
          Bio & Identity
        </h2>
        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Display Name */}
            <div>
              <Label htmlFor='displayName' className='text-sm font-medium'>
                Display Name
              </Label>
              <Input
                id='displayName'
                name='displayName'
                type='text'
                defaultValue={profile.displayName}
                className='mt-1'
                required
              />
              {state &&
                !state.ok &&
                state.error.code === 'VALIDATION_ERROR' && (
                  <p className='mt-1 text-sm text-red-600'>
                    {/* @ts-expect-error - error cause structure */}
                    {state.error.cause?.displayName?.[0]}
                  </p>
                )}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor='role' className='text-sm font-medium'>
                Role / Position
              </Label>
              <Input
                id='role'
                name='role'
                type='text'
                defaultValue={profile.role}
                className='mt-1'
                required
              />
              {state &&
                !state.ok &&
                state.error.code === 'VALIDATION_ERROR' && (
                  <p className='mt-1 text-sm text-red-600'>
                    {/* @ts-expect-error - error cause structure */}
                    {state.error.cause?.role?.[0]}
                  </p>
                )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor='bio' className='text-sm font-medium'>
              About Me (Optional)
            </Label>
            <Textarea
              id='bio'
              name='bio'
              defaultValue={profile.bio ?? ''}
              className='mt-1'
              rows={4}
              placeholder='Describe yourself to help the AI understand your context better...'
            />
            {state && !state.ok && state.error.code === 'VALIDATION_ERROR' && (
              <p className='mt-1 text-sm text-red-600'>
                {/* @ts-expect-error - error cause structure */}
                {state.error.cause?.bio?.[0]}
              </p>
            )}
          </div>

          {/* Chronotype Calibration Section */}
          <div className='mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800'>
            <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
              Chronotype Calibration
            </h3>

            <div className='mt-4 space-y-4'>
              {/* Standard Working Hours */}
              <div>
                <Label className='text-sm font-medium'>
                  Standard Working Hours
                </Label>
                <div className='mt-2 grid grid-cols-2 gap-4'>
                  <div>
                    <Label
                      htmlFor='workingStartTime'
                      className='text-xs text-zinc-600 dark:text-zinc-400'
                    >
                      Start
                    </Label>
                    <Input
                      id='workingStartTime'
                      name='workingStartTime'
                      type='time'
                      defaultValue={formatTimeFromMinutes(
                        profile.workingStartMinutes,
                      )}
                      className='mt-1'
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='workingEndTime'
                      className='text-xs text-zinc-600 dark:text-zinc-400'
                    >
                      End
                    </Label>
                    <Input
                      id='workingEndTime'
                      name='workingEndTime'
                      type='time'
                      defaultValue={formatTimeFromMinutes(
                        profile.workingEndMinutes,
                      )}
                      className='mt-1'
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Primary Focus Period */}
              <div>
                <Label className='text-sm font-medium'>
                  Primary Focus Period
                </Label>
                <div className='mt-2 flex gap-3'>
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-600 has-[:checked]:text-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-500 dark:hover:bg-zinc-800'>
                    <input
                      id='primaryFocusPeriod-morning'
                      type='radio'
                      name='primaryFocusPeriod'
                      value={PrimaryFocusPeriod.Morning}
                      defaultChecked={
                        profile.primaryFocusPeriod ===
                        PrimaryFocusPeriod.Morning
                      }
                      className='sr-only'
                    />
                    Morning Focus
                  </label>
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-600 has-[:checked]:text-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-500 dark:hover:bg-zinc-800'>
                    <input
                      id='primaryFocusPeriod-noon'
                      type='radio'
                      name='primaryFocusPeriod'
                      value={PrimaryFocusPeriod.Noon}
                      defaultChecked={
                        profile.primaryFocusPeriod === PrimaryFocusPeriod.Noon
                      }
                      className='sr-only'
                    />
                    Noon Focus
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800'>
            {state && state.ok && (
              <p className='text-sm text-green-600 dark:text-green-400'>
                Profile updated successfully!
              </p>
            )}
            {state && !state.ok && state.error.code !== 'VALIDATION_ERROR' && (
              <p className='text-sm text-red-600'>{state.error.message}</p>
            )}
            <Button
              id='save-profile-button'
              type='submit'
              disabled={isPending}
              className='px-6'
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
