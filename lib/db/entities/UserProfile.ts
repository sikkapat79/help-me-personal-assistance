import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { PrimaryFocusPeriod } from '@/lib/features/profile/schema';

@Entity('user_profile')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, name: 'display_name' })
  displayName!: string;

  @Column({ type: 'varchar', length: 100 })
  role!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'integer', name: 'working_start_minutes' })
  workingStartMinutes!: number;

  @Column({ type: 'integer', name: 'working_end_minutes' })
  workingEndMinutes!: number;

  @Column({ type: 'varchar', length: 50, name: 'primary_focus_period' })
  primaryFocusPeriod!: PrimaryFocusPeriod;

  @Column({ type: 'varchar', length: 64, name: 'time_zone' })
  timeZone!: string;

  @Column({ type: 'integer', name: 'morning_poke_time_minutes' })
  morningPokeTimeMinutes!: number;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: {
    displayName: string;
    role: string;
    bio?: string | null;
    workingStartMinutes: number;
    workingEndMinutes: number;
    primaryFocusPeriod: PrimaryFocusPeriod;
    timeZone?: string;
    morningPokeTimeMinutes?: number;
  }) {
    if (data) {
      this.displayName = UserProfile.normalizeDisplayName(data.displayName);
      this.role = UserProfile.normalizeRole(data.role);
      this.bio = data.bio ?? null;
      this.workingStartMinutes = data.workingStartMinutes;
      this.workingEndMinutes = data.workingEndMinutes;
      this.primaryFocusPeriod = data.primaryFocusPeriod;
      this.timeZone = UserProfile.normalizeTimeZone(data.timeZone ?? 'UTC');
      this.morningPokeTimeMinutes = UserProfile.normalizeMinutesSinceMidnight(
        data.morningPokeTimeMinutes ?? 480,
      );

      // Explicitly set timestamps for new entities
      const now = new Date();
      this.createdAt = now;
      this.updatedAt = now;
    }
  }

  // Pure domain methods (no DB/network)
  updateProfile(data: {
    displayName?: string;
    role?: string;
    bio?: string | null;
    workingStartMinutes?: number;
    workingEndMinutes?: number;
    primaryFocusPeriod?: PrimaryFocusPeriod;
    timeZone?: string;
    morningPokeTimeMinutes?: number;
  }): void {
    if (data.displayName !== undefined) {
      this.displayName = UserProfile.normalizeDisplayName(data.displayName);
    }
    if (data.role !== undefined) {
      this.role = UserProfile.normalizeRole(data.role);
    }
    if (data.bio !== undefined) {
      this.bio = data.bio;
    }
    if (data.workingStartMinutes !== undefined) {
      this.workingStartMinutes = data.workingStartMinutes;
    }
    if (data.workingEndMinutes !== undefined) {
      this.workingEndMinutes = data.workingEndMinutes;
    }
    if (data.primaryFocusPeriod !== undefined) {
      this.primaryFocusPeriod = data.primaryFocusPeriod;
    }
    if (data.timeZone !== undefined) {
      this.timeZone = UserProfile.normalizeTimeZone(data.timeZone);
    }
    if (data.morningPokeTimeMinutes !== undefined) {
      this.morningPokeTimeMinutes = UserProfile.normalizeMinutesSinceMidnight(
        data.morningPokeTimeMinutes,
      );
    }

    // Domain model controls its own timestamp
    this.updatedAt = new Date();
  }

  private static normalizeDisplayName(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Display name is required');
    if (trimmed.length > 100)
      throw new Error('Display name is too long (max 100 characters)');
    return trimmed;
  }

  private static normalizeRole(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Role is required');
    if (trimmed.length > 100)
      throw new Error('Role is too long (max 100 characters)');
    return trimmed;
  }

  private static normalizeTimeZone(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Time zone is required');
    if (trimmed.length > 64) throw new Error('Time zone is too long');
    return trimmed;
  }

  private static normalizeMinutesSinceMidnight(value: number): number {
    if (!Number.isInteger(value)) {
      throw new TypeError('Poke time must be an integer number of minutes');
    }
    if (value < 0 || value > 1439) {
      throw new Error('Poke time must be between 0 and 1439 minutes');
    }
    return value;
  }
}
