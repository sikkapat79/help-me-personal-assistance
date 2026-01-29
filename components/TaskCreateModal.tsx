'use client';

import React, { useState } from 'react';
import { TaskFormModal } from '@/components/TaskFormModal';
import { Button } from '@/components/ui/button';

export function TaskCreateModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        id='add-task-button'
        type='button'
        onClick={() => setOpen(true)}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls='task-create-modal'
      >
        Add Task
      </Button>
      <TaskFormModal open={open} onOpenChange={setOpen} mode='create' />
    </>
  );
}
