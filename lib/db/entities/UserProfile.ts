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
  }) {
    if (data) {
      this.displayName = UserProfile.normalizeDisplayName(data.displayName);
      this.role = UserProfile.normalizeRole(data.role);
      this.bio = data.bio ?? null;
      this.workingStartMinutes = data.workingStartMinutes;
      this.workingEndMinutes = data.workingEndMinutes;
      this.primaryFocusPeriod = data.primaryFocusPeriod;

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
}
