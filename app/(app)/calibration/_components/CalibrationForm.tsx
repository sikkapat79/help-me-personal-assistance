'use client';

import React, { useActionState, useTransition, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { COMMON_TIMEZONES } from '@/lib/features/profile/timezones';

interface CalibrationFormProps {
  readonly profile: UserProfileData;
}

export function CalibrationForm({ profile }: CalibrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(updateProfileAction, null);
  const toast = useToast();
  const lastSuccessRef = useRef<boolean>(false);
  const [timeZone, setTimeZone] = React.useState<string>(profile.timeZone);

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      if (!lastSuccessRef.current) {
        lastSuccessRef.current = true;
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved.',
        });
      }
    } else {
      lastSuccessRef.current = false;
      if (state.error.code !== 'VALIDATION_ERROR') {
        toast.error('Failed to update profile', {
          description: state.error.message,
        });
      }
    }
  }, [state, toast]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    lastSuccessRef.current = false;

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

    // Convert morning poke time (HH:MM) to minutes since midnight
    const morningPokeTime = formData.get('morningPokeTime') as string;
    if (morningPokeTime) {
      const [pokeHours, pokeMinutes] = morningPokeTime.split(':').map(Number);
      formData.set(
        'morningPokeTimeMinutes',
        String(pokeHours * 60 + pokeMinutes),
      );
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div id='calibration-form' className='space-y-8'>
      {/* Bio & Identity Section */}
      <div className='rounded-lg border border-border bg-card p-6 shadow-sm'>
        <h2 className='text-xl font-semibold text-card-foreground'>
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
          <div className='mt-6 border-t border-border pt-6'>
            <h3 className='text-lg font-semibold text-card-foreground'>
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
                      className='text-xs text-muted-foreground'
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
                      className='text-xs text-muted-foreground'
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
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
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
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
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

          {/* Timezone & Reminder Settings Section */}
          <div className='mt-6 border-t border-border pt-6'>
            <h3 className='text-lg font-semibold text-card-foreground'>
              Timezone & Reminder Settings
            </h3>

            <div className='mt-4 space-y-4'>
              {/* Timezone */}
              <div>
                <Label htmlFor='timeZone' className='text-sm font-medium'>
                  Timezone
                </Label>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Your local timezone for accurate date calculations and
                  reminders
                </p>
                <input type='hidden' name='timeZone' value={timeZone} />
                <Select value={timeZone} onValueChange={setTimeZone} required>
                  <SelectTrigger id='timeZone' className='mt-2'>
                    <SelectValue placeholder='Select timezone' />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state &&
                  !state.ok &&
                  state.error.code === 'VALIDATION_ERROR' && (
                    <p className='mt-1 text-sm text-red-600'>
                      {/* @ts-expect-error - error cause structure */}
                      {state.error.cause?.timeZone?.[0]}
                    </p>
                  )}
              </div>

              {/* Morning Poke Time */}
              <div>
                <Label
                  htmlFor='morningPokeTime'
                  className='text-sm font-medium'
                >
                  Morning Reminder Time
                </Label>
                <p className='mt-1 text-xs text-muted-foreground'>
                  When to show the morning check-in reminder (local time)
                </p>
                <Input
                  id='morningPokeTime'
                  name='morningPokeTime'
                  type='time'
                  defaultValue={formatTimeFromMinutes(
                    profile.morningPokeTimeMinutes,
                  )}
                  className='mt-2'
                  required
                />
                {state &&
                  !state.ok &&
                  state.error.code === 'VALIDATION_ERROR' && (
                    <p className='mt-1 text-sm text-red-600'>
                      {/* @ts-expect-error - error cause structure */}
                      {state.error.cause?.morningPokeTimeMinutes?.[0]}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex items-center justify-end gap-3 border-t border-border pt-4'>
            {state && state.ok && (
              <p className='text-sm text-green-600'>
                Profile updated successfully!
              </p>
            )}
            {state && !state.ok && state.error.code !== 'VALIDATION_ERROR' && (
              <p className='text-sm text-red-600'>{state.error.message}</p>
            )}
            <Button
              id='save-profile-button'
              type='submit'
              loading={isPending}
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
