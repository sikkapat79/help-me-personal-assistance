'use client';

import React, { useTransition } from 'react';
import { logoutProfileAction } from '@/app/_actions/logout-profile';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const handleLogout = () => {
    startTransition(() => {
      // This action clears the cookie then redirects; it doesn't return a result.
      void logoutProfileAction();
    });
  };

  return (
    <Button
      id='logout-button'
      onClick={handleLogout}
      disabled={isPending}
      variant='outline'
      size='sm'
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
