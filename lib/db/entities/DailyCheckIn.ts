import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { UserProfile } from './UserProfile';

export enum MorningMood {
  Fresh = 'Fresh',
  Neutral = 'Neutral',
  Tired = 'Tired',
  Taxed = 'Taxed',
}

@Entity('daily_check_in')
export class DailyCheckIn {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'owner_id' })
  owner!: UserProfile;

  @Column({ type: 'date', name: 'check_in_date' })
  checkInDate!: string; // YYYY-MM-DD

  @Column({ type: 'integer', name: 'rest_quality_1to10' })
  restQuality1to10!: number;

  @Column({ type: 'varchar', length: 50, name: 'morning_mood' })
  morningMood!: MorningMood;

  @Column({ type: 'integer', name: 'energy_budget' })
  energyBudget!: number;

  @Column({ type: 'text', name: 'sleep_notes', nullable: true })
  sleepNotes!: string | null;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: {
    owner: UserProfile;
    checkInDate: string;
    restQuality1to10: number;
    morningMood: MorningMood;
    energyBudget: number;
    sleepNotes?: string | null;
  }) {
    if (data) {
      // Generate UUID v7 (time-ordered) for new check-ins
      this.id = uuidv7();
      this.owner = data.owner;
      this.checkInDate = data.checkInDate;
      this.restQuality1to10 = data.restQuality1to10;
      this.morningMood = data.morningMood;
      this.energyBudget = data.energyBudget;
      this.sleepNotes = data.sleepNotes ?? null;

      const now = new Date();
      this.createdAt = now;
      this.updatedAt = now;
    }
  }

  // Domain method to update check-in (DDD principle: entity controls its own state)
  updateCheckIn(data: {
    restQuality1to10?: number;
    morningMood?: MorningMood;
    energyBudget?: number;
    sleepNotes?: string | null;
  }): void {
    if (data.restQuality1to10 !== undefined) {
      this.restQuality1to10 = data.restQuality1to10;
    }
    if (data.morningMood !== undefined) {
      this.morningMood = data.morningMood;
    }
    if (data.energyBudget !== undefined) {
      this.energyBudget = data.energyBudget;
    }
    if (data.sleepNotes !== undefined) {
      this.sleepNotes = data.sleepNotes;
    }

    // Domain model controls its own timestamp
    this.updatedAt = new Date();
  }
}
