'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { generateYesterdaySummaryAction } from '@/app/_actions/generate-yesterday-summary';

interface YesterdaySummaryCardProps {
  readonly yesterdaySummary: string | null;
  readonly yesterdayYyyyMmDd: string;
  readonly showFallbackButton: boolean;
}

export function YesterdaySummaryCard({
  yesterdaySummary,
  yesterdayYyyyMmDd,
  showFallbackButton,
}: YesterdaySummaryCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      await generateYesterdaySummaryAction(yesterdayYyyyMmDd);
    });
  };

  if (yesterdaySummary) {
    return (
      <section
        id='yesterday-summary-card'
        className='rounded-lg border border-border bg-muted/30 p-4'
      >
        <h2 className='text-sm font-semibold text-foreground'>
          Yesterday&apos;s summary
        </h2>
        <p className='mt-2 whitespace-pre-wrap text-sm text-muted-foreground'>
          {yesterdaySummary}
        </p>
      </section>
    );
  }

  if (showFallbackButton) {
    return (
      <section
        id='yesterday-summary-card'
        className='rounded-lg border border-dashed border-border bg-muted/20 p-4'
      >
        <h2 className='text-sm font-semibold text-foreground'>
          Yesterday&apos;s summary
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          No summary yet. Generate one from yesterday&apos;s check-in.
        </p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='mt-3'
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? 'Generating…' : "Generate yesterday's summary"}
        </Button>
      </section>
    );
  }

  return null;
}
