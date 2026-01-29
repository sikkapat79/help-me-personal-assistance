'use client';

import { useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reprioritizeTodayAction } from '@/app/_actions/reprioritize-today';
import { useToast } from '@/lib/hooks/use-toast';

interface ReprioritizeTodayButtonProps {
  show?: boolean;
}

export function ReprioritizeTodayButton({
  show = true,
}: Readonly<ReprioritizeTodayButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  if (!show) {
    return null;
  }

  const handleClick = () => {
    startTransition(async () => {
      const result = await reprioritizeTodayAction();

      if (result.ok) {
        toast.success('Plan updated', {
          description: 'Today’s tasks have been reprioritized.',
        });
      } else {
        toast.error('Could not reprioritize', {
          description: result.error,
        });
      }
    });
  };

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={handleClick}
      disabled={isPending}
      loading={isPending}
      aria-label='Poke AI to reprioritize today’s tasks'
    >
      <Sparkles className='h-4 w-4' aria-hidden />
      Reprioritize
    </Button>
  );
}
