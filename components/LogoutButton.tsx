'use client';

import React, { useTransition } from 'react';
import { logoutProfileAction } from '@/app/_actions/logout-profile';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutProfileAction();
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
