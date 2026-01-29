import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

import { UserProfile } from './UserProfile';

@Entity('daily_plan')
export class DailyPlan {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'owner_id' })
  owner!: UserProfile;

  @Column({ type: 'date', name: 'plan_date' })
  planDate!: string; // YYYY-MM-DD

  @Column({ type: 'integer', name: 'energy_budget' })
  energyBudget!: number;

  @Column({ type: 'varchar', length: 50, name: 'algorithm_version' })
  algorithmVersion!: string;

  @Column({ type: 'jsonb', name: 'ranked_task_ids' })
  rankedTaskIds!: string[];

  @Column({ type: 'jsonb', name: 'task_reasoning' })
  taskReasoning!: Record<string, string>;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: {
    owner: UserProfile;
    planDate: string;
    energyBudget: number;
    algorithmVersion: string;
    rankedTaskIds: string[];
    taskReasoning: Record<string, string>;
  }) {
    if (data) {
      this.id = uuidv7();
      this.owner = data.owner;
      this.planDate = data.planDate;
      this.energyBudget = data.energyBudget;
      this.algorithmVersion = data.algorithmVersion;
      this.rankedTaskIds = data.rankedTaskIds;
      this.taskReasoning = data.taskReasoning;

      const now = new Date();
      this.createdAt = now;
      this.updatedAt = now;
    }
  }

  updatePlan(data: {
    energyBudget?: number;
    algorithmVersion?: string;
    rankedTaskIds?: string[];
    taskReasoning?: Record<string, string>;
  }): void {
    if (data.energyBudget !== undefined) {
      this.energyBudget = data.energyBudget;
    }
    if (data.algorithmVersion !== undefined) {
      this.algorithmVersion = data.algorithmVersion;
    }
    if (data.rankedTaskIds !== undefined) {
      this.rankedTaskIds = data.rankedTaskIds;
    }
    if (data.taskReasoning !== undefined) {
      this.taskReasoning = data.taskReasoning;
    }

    this.updatedAt = new Date();
  }
}
