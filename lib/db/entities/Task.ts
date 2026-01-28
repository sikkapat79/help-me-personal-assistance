import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';

@Entity()
export class Task {
  @PrimaryKey({ type: 'uuid', nullable: true })
  id!: string;

  @Property({ type: 'string' })
  title: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null;

  @Enum(() => TaskIntensity)
  @Property({ type: 'string', nullable: true })
  intensity: TaskIntensity;

  @Property({ nullable: true, type: 'timestamptz' })
  dueAt: Date | null;

  @Property({ type: 'json' })
  tags: string[];

  @Enum(() => TaskStatus)
  @Property({ type: 'string', nullable: true })
  status: TaskStatus;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(data: {
    title: string;
    description?: string | null;
    intensity?: TaskIntensity;
    dueAt?: Date | null;
    tags?: string[];
  }) {
    this.title = Task.normalizeTitle(data.title);
    this.description = data.description ?? null;
    this.intensity = data.intensity ?? TaskIntensity.QuickWin;
    this.dueAt = data.dueAt ?? null;
    this.tags = data.tags ?? [];
    this.status = TaskStatus.Pending;
  }

  // Pure domain methods (no DB/network)
  updateStatus(nextStatus: TaskStatus): void {
    this.status = nextStatus;
  }

  reschedule(nextDueAt: Date | null): void {
    this.dueAt = nextDueAt;
  }

  updateIntensity(nextIntensity: TaskIntensity): void {
    this.intensity = nextIntensity;
  }

  private static normalizeTitle(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Task title is required');
    if (trimmed.length > 200)
      throw new Error('Task title is too long (max 200 characters)');
    return trimmed;
  }
}
