import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

import { UserProfile } from './UserProfile';
import { Task } from './Task';

/** Post-task capacity state (same values as MorningMood for consistency). */
export type CapacityStateAfter = 'Fresh' | 'Tired' | 'Taxed';

@Entity('energy_deduction_event')
export class EnergyDeductionEvent {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'owner_id' })
  owner!: UserProfile;

  @Column({ type: 'date', name: 'plan_date' })
  planDate!: string; // YYYY-MM-DD

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ type: 'varchar', length: 50, name: 'capacity_state_after' })
  capacityStateAfter!: CapacityStateAfter;

  @Column({ type: 'integer', name: 'deducted_amount' })
  deductedAmount!: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'task_intensity_snapshot',
    nullable: true,
  })
  taskIntensitySnapshot!: string | null;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  constructor(data?: {
    owner: UserProfile;
    planDate: string;
    task: Task;
    capacityStateAfter: CapacityStateAfter;
    deductedAmount: number;
    taskIntensitySnapshot?: string | null;
  }) {
    if (data) {
      this.id = uuidv7();
      this.owner = data.owner;
      this.planDate = data.planDate;
      this.task = data.task;
      this.capacityStateAfter = data.capacityStateAfter;
      this.deductedAmount = data.deductedAmount;
      this.taskIntensitySnapshot = data.taskIntensitySnapshot ?? null;

      this.createdAt = new Date();
    }
  }
}
