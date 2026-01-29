'use client';

import { useEffect, useState } from 'react';
import { fetchSuccessCorrelationInsightAction } from '@/app/_actions/fetch-success-correlation-insight';
import type { DailyReportRow } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import { Loader2 } from 'lucide-react';

interface SuccessCorrelationCardProps {
  startDate: string;
  endDate: string;
  rows: DailyReportRow[];
}

export function SuccessCorrelationCard({
  startDate,
  endDate,
  rows,
}: SuccessCorrelationCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await fetchSuccessCorrelationInsightAction(
        startDate,
        endDate,
        rows,
      );
      if (cancelled) return;
      setIsLoading(false);
      if (result.ok) {
        setInsight(result.insight);
      } else {
        setError(result.error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, rows]);

  return (
    <section
      id='success-correlation'
      className='rounded-lg border border-border bg-primary/5 p-4'
    >
      <h2 className='text-sm font-semibold text-foreground'>
        SUCCESS CORRELATION
      </h2>
      <div className='mt-2'>
        {isLoading && (
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2
              className='h-4 w-4 animate-spin shrink-0'
              aria-hidden
            />
            Loading…
          </p>
        )}
        {!isLoading && error && (
          <p className='text-sm text-muted-foreground'>{error}</p>
        )}
        {!isLoading && !error && insight && (
          <p className='text-sm text-muted-foreground'>{insight}</p>
        )}
        {!isLoading && !error && !insight && (
          <p className='text-sm text-muted-foreground'>
            Pending… Log a few days of check-ins and tasks to see insights.
          </p>
        )}
      </div>
    </section>
  );
}
