import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TaskIntensity, TaskStatus } from '@/lib/features/tasks/schema';
import { UserProfile } from './UserProfile';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserProfile, { nullable: false })
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

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
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
