'use client';

import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getPageTitleForPath } from '@/lib/route-titles';

/**
 * Shown while a page in (app) loads. Title in the same position as page titles,
 * loading indicator below it (same structure as real pages).
 */
export default function AppLoading() {
  const pathname = usePathname();
  const { title, subtitle } = getPageTitleForPath(pathname ?? '/');

  return (
    <div className='space-y-8'>
      <div className='view-transition-title'>
        <h1 className='text-3xl font-bold text-foreground'>{title}</h1>
        {subtitle != null && (
          <p className='mt-1 text-muted-foreground'>{subtitle}</p>
        )}
      </div>
      <div
        className='view-transition-page flex min-h-[30vh] items-center justify-center'
        aria-live='polite'
        aria-label='Loading page'
      >
        <Loader2
          className='h-8 w-8 animate-spin text-muted-foreground'
          aria-hidden
        />
      </div>
    </div>
  );
}
