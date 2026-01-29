'use client';

import React, { useActionState, useTransition, useEffect, useRef } from 'react';
import { createProfileAction } from '@/app/_actions/create-profile';
import { PrimaryFocusPeriod } from '@/lib/features/profile/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';

export function CreateProfileForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createProfileAction, null);
  const toast = useToast();
  const didToastSuccessRef = useRef(false);

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      if (didToastSuccessRef.current) return;
      didToastSuccessRef.current = true;
      toast.success('Profile created successfully', {
        description: 'Your profile has been created and selected.',
      });
    } else {
      if (state.error.code !== 'VALIDATION_ERROR') {
        toast.error('Failed to create profile', {
          description: state.error.message,
        });
      }
    }
  }, [state, toast]);

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

    // Capture timezone from browser (silent, auto-detected)
    const detectedTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    formData.set('timeZone', detectedTimeZone);
    formData.set('morningPokeTimeMinutes', '480'); // Default 08:00

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div
      id='create-profile-form'
      className='rounded-lg border border-border bg-card p-6 shadow-sm'
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Display Name and Role */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='create-displayName' className='text-sm font-medium'>
              Display Name
            </Label>
            <Input
              id='create-displayName'
              name='displayName'
              type='text'
              placeholder='Alex Rivera'
              className='mt-1'
              required
            />
            {state && !state.ok && state.error.code === 'VALIDATION_ERROR' && (
              <p className='mt-1 text-sm text-red-600'>
                {/* @ts-expect-error - error cause structure */}
                {state.error.cause?.displayName?.[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='create-role' className='text-sm font-medium'>
              Role / Position
            </Label>
            <Input
              id='create-role'
              name='role'
              type='text'
              placeholder='Senior Product Architect'
              className='mt-1'
              required
            />
            {state && !state.ok && state.error.code === 'VALIDATION_ERROR' && (
              <p className='mt-1 text-sm text-red-600'>
                {/* @ts-expect-error - error cause structure */}
                {state.error.cause?.role?.[0]}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor='create-bio' className='text-sm font-medium'>
            About Me (Optional)
          </Label>
          <Textarea
            id='create-bio'
            name='bio'
            className='mt-1'
            rows={3}
            placeholder='Describe yourself...'
          />
        </div>

        {/* Working Hours */}
        <div>
          <Label className='text-sm font-medium'>Working Hours</Label>
          <div className='mt-2 grid grid-cols-2 gap-4'>
            <div>
              <Label
                htmlFor='create-workingStartTime'
                className='text-xs text-muted-foreground'
              >
                Start
              </Label>
              <Input
                id='create-workingStartTime'
                name='workingStartTime'
                type='time'
                defaultValue='09:00'
                className='mt-1'
                required
              />
            </div>
            <div>
              <Label
                htmlFor='create-workingEndTime'
                className='text-xs text-muted-foreground'
              >
                End
              </Label>
              <Input
                id='create-workingEndTime'
                name='workingEndTime'
                type='time'
                defaultValue='18:00'
                className='mt-1'
                required
              />
            </div>
          </div>
        </div>

        {/* Primary Focus Period */}
        <div>
          <Label className='text-sm font-medium'>Primary Focus Period</Label>
          <div className='mt-2 flex gap-3'>
            <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
              <input
                id='create-primaryFocusPeriod-morning'
                type='radio'
                name='primaryFocusPeriod'
                value={PrimaryFocusPeriod.Morning}
                defaultChecked
                className='sr-only'
              />
              Morning Focus
            </label>
            <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
              <input
                id='create-primaryFocusPeriod-noon'
                type='radio'
                name='primaryFocusPeriod'
                value={PrimaryFocusPeriod.Noon}
                className='sr-only'
              />
              Noon Focus
            </label>
          </div>
        </div>

        {/* Error message */}
        {state && !state.ok && state.error.code !== 'VALIDATION_ERROR' && (
          <p className='text-sm text-red-600'>{state.error.message}</p>
        )}

        {/* Submit Button */}
        <Button
          id='create-profile-button'
          type='submit'
          loading={isPending}
          className='w-full'
        >
          {isPending ? 'Creating Profile...' : 'Create Profile & Continue'}
        </Button>
      </form>
    </div>
  );
}
