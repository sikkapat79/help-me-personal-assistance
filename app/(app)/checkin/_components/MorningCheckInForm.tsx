'use client';

import React, {
  useActionState,
  useTransition,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { submitMorningCheckInAction } from '@/app/_actions/submit-morning-checkin';
import { MorningMood } from '@/lib/features/checkin/schema';
import { suggestEnergyBudget } from '@/lib/features/checkin/suggestEnergyBudget';
import { DailyCheckInData } from '@/lib/features/checkin/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';

interface MorningCheckInFormProps {
  readonly existingCheckIn: DailyCheckInData | null;
}

export function MorningCheckInForm({
  existingCheckIn,
}: MorningCheckInFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(submitMorningCheckInAction, null);
  const toast = useToast();
  const router = useRouter();
  const lastSuccessRef = useRef<boolean>(false);

  // Local state for inputs and energy budget display
  const [restQuality, setRestQuality] = useState<number>(
    existingCheckIn?.restQuality1to10 ?? 7,
  );
  const [morningMood, setMorningMood] = useState<MorningMood>(
    existingCheckIn?.morningMood ?? MorningMood.Fresh,
  );

  // Calculate energy budget from current inputs
  const energyBudget = suggestEnergyBudget(restQuality, morningMood);

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      if (!lastSuccessRef.current) {
        lastSuccessRef.current = true;
        toast.success('Check-in saved', {
          description: 'Your morning check-in has been recorded.',
        });
        // Redirect back to Today page after success
        startTransition(() => {
          router.push('/');
        });
      }
    } else {
      lastSuccessRef.current = false;
      toast.error('Failed to save check-in', {
        description: state.formError,
      });
    }
  }, [state, toast, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    lastSuccessRef.current = false;

    // Add today's date in YYYY-MM-DD format (client timezone)
    const today = new Date().toISOString().split('T')[0];
    formData.set('checkInDate', today);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div
      id='checkin-form'
      className='rounded-lg border border-border bg-card p-6 shadow-sm'
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Sleeping Quality (1-10) */}
        <div>
          <Label htmlFor='restQuality1to10' className='text-sm font-medium'>
            Sleeping Quality (1-10)
          </Label>
          <p className='mt-1 text-xs text-muted-foreground'>
            How well did you sleep last night?
          </p>
          <div className='mt-3 flex items-center gap-4'>
            <Input
              id='restQuality1to10'
              name='restQuality1to10'
              type='range'
              min='1'
              max='10'
              value={restQuality}
              onChange={(e) => setRestQuality(parseInt(e.target.value, 10))}
              className='flex-1 shadow-none'
              required
            />
            <span className='text-2xl font-bold text-foreground w-12 text-center'>
              {restQuality}
            </span>
          </div>
          {state && !state.ok && state.fieldErrors?.restQuality1to10 && (
            <p className='mt-1 text-sm text-red-600'>
              {state.fieldErrors.restQuality1to10}
            </p>
          )}
        </div>

        {/* Morning Mood */}
        <div>
          <Label className='text-sm font-medium'>Morning Mood</Label>
          <p className='mt-1 text-xs text-muted-foreground'>
            How do you feel right now?
          </p>
          <div className='mt-3 flex gap-3'>
            <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
              <input
                type='radio'
                name='morningMood'
                value={MorningMood.Fresh}
                checked={morningMood === MorningMood.Fresh}
                onChange={(e) => setMorningMood(e.target.value as MorningMood)}
                className='sr-only'
              />
              Fresh
            </label>
            <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
              <input
                type='radio'
                name='morningMood'
                value={MorningMood.Tired}
                checked={morningMood === MorningMood.Tired}
                onChange={(e) => setMorningMood(e.target.value as MorningMood)}
                className='sr-only'
              />
              Tired
            </label>
            <label className='flex flex-1 cursor-pointer items-center justify-center rounded-md border-2 border-input bg-background px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-accent'>
              <input
                type='radio'
                name='morningMood'
                value={MorningMood.Taxed}
                checked={morningMood === MorningMood.Taxed}
                onChange={(e) => setMorningMood(e.target.value as MorningMood)}
                className='sr-only'
              />
              Taxed
            </label>
          </div>
          {state && !state.ok && state.fieldErrors?.morningMood && (
            <p className='mt-1 text-sm text-red-600'>
              {state.fieldErrors.morningMood}
            </p>
          )}
        </div>

        {/* Energy Budget (display only) */}
        <div className='rounded-lg border border-border bg-muted/50 p-4'>
          <Label className='text-sm font-medium'>Energy Budget (Today)</Label>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-4xl font-bold text-foreground'>
              {energyBudget}
            </span>
            <span className='text-sm text-muted-foreground'>points</span>
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            Calculated from your sleeping quality and morning mood
          </p>
        </div>

        {/* Submit Button */}
        <div className='flex items-center justify-end gap-3 border-t border-border pt-4'>
          {state && !state.ok && !state.fieldErrors && (
            <p className='text-sm text-red-600'>{state.formError}</p>
          )}
          <Button
            id='save-checkin-button'
            type='submit'
            disabled={isPending}
            className='px-6'
          >
            {isPending
              ? 'Saving...'
              : existingCheckIn
                ? 'Update Check-in'
                : 'Save Check-in'}
          </Button>
        </div>
      </form>
    </div>
  );
}
