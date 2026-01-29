'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MorningMood } from '@/lib/features/checkin/schema';

export type PostTaskEnergyChoice = MorningMood | 'Skip';

interface PostTaskEnergyDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (choice: PostTaskEnergyChoice) => void;
  readonly taskTitle: string;
  readonly isPending?: boolean;
}

export function PostTaskEnergyDialog({
  open,
  onOpenChange,
  onSelect,
  taskTitle,
  isPending = false,
}: PostTaskEnergyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>How did this task leave you?</DialogTitle>
          <DialogDescription>
            We use this to update your energy for the day. Task: {taskTitle}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2 pt-2'>
          <Button
            variant='default'
            className='w-full justify-start'
            disabled={isPending}
            onClick={() => onSelect(MorningMood.Fresh)}
          >
            Still fresh
          </Button>
          <Button
            variant='secondary'
            className='w-full justify-start'
            disabled={isPending}
            onClick={() => onSelect(MorningMood.Tired)}
          >
            Tired
          </Button>
          <Button
            variant='secondary'
            className='w-full justify-start'
            disabled={isPending}
            onClick={() => onSelect(MorningMood.Taxed)}
          >
            Taxed
          </Button>
          <Button
            variant='ghost'
            className='w-full justify-start text-muted-foreground'
            disabled={isPending}
            onClick={() => onSelect('Skip')}
          >
            Skip (complete without tracking energy)
          </Button>
        </div>
        {isPending && (
          <div className='flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
            <span>Saving...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
