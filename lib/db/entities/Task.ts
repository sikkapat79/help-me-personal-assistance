import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import { UserProfile } from './UserProfile';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'owner_id' })
  owner!: UserProfile;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 50 })
  intensity!: TaskIntensity;

  @Column({ type: 'timestamptz', nullable: true, name: 'due_at' })
  dueAt!: Date | null;

  @Column({ type: 'jsonb' })
  tags!: string[];

  @Column({ type: 'varchar', length: 50 })
  status!: TaskStatus;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: {
    owner: UserProfile;
    title: string;
    description?: string | null;
    intensity?: TaskIntensity;
    dueAt?: Date | null;
    tags?: string[];
  }) {
    if (data) {
      this.owner = data.owner;
      this.title = Task.normalizeTitle(data.title);
      this.description = data.description ?? null;
      this.intensity = data.intensity ?? TaskIntensity.QuickWin;
      this.dueAt = data.dueAt ?? null;
      this.tags = data.tags ?? [];
      this.status = TaskStatus.Pending;

      // Set createdAt for new entities - TypeORM will handle updatedAt automatically
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
  }

  // Pure domain methods (no DB/network)
  updateStatus(nextStatus: TaskStatus): void {
    this.status = nextStatus;
    this.updatedAt = new Date();
  }

  reschedule(nextDueAt: Date | null): void {
    this.dueAt = nextDueAt;
    this.updatedAt = new Date();
  }

  updateIntensity(nextIntensity: TaskIntensity): void {
    this.intensity = nextIntensity;
    this.updatedAt = new Date();
  }

  updateDetails(details: {
    title: string;
    description: string | null;
    intensity: TaskIntensity;
    dueAt: Date | null;
    tags: string[];
  }): void {
    this.title = Task.normalizeTitle(details.title);
    this.description = details.description ?? null;
    this.intensity = details.intensity ?? TaskIntensity.QuickWin;
    this.dueAt = details.dueAt ?? null;
    this.tags = details.tags ?? [];
    this.updatedAt = new Date();
  }

  private static normalizeTitle(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Task title is required');
    if (trimmed.length > 200)
      throw new Error('Task title is too long (max 200 characters)');
    return trimmed;
  }
}
