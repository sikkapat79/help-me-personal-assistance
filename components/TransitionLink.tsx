'use client';

import { type ComponentProps, useCallback } from 'react';
import { Link } from 'next-view-transitions';
import { getTransitionDirection } from '@/lib/view-transitions';

const TRANSITION_DIRECTION_ATTR = 'data-transition-direction';

export function setTransitionDirection(direction: 'forward' | 'back'): void {
  document.documentElement.setAttribute(TRANSITION_DIRECTION_ATTR, direction);
}

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * Link that sets view-transition direction (forward/back) from route order
 * so the slide animation matches navigation direction.
 */
export function TransitionLink({
  href,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const toPath =
        typeof href === 'string'
          ? href
          : ((href as { pathname?: string }).pathname ?? '/');
      const fromPath =
        globalThis.window === undefined ? '/' : globalThis.location.pathname;
      setTransitionDirection(getTransitionDirection(fromPath, toPath));
      onClick?.(e);
    },
    [href, onClick],
  );

  return <Link href={href} onClick={handleClick} {...rest} />;
}
