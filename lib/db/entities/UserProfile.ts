import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

import { PrimaryFocusPeriod } from '@/lib/features/profile/schema';

@Entity({ tableName: 'user_profile' })
export class UserProfile {
  @PrimaryKey({ type: 'uuid', nullable: true })
  id!: string;

  @Property({ type: 'string' })
  displayName: string;

  @Property({ type: 'string' })
  role: string;

  @Property({ nullable: true, type: 'text' })
  bio: string | null;

  @Property({ type: 'integer' })
  workingStartMinutes: number;

  @Property({ type: 'integer' })
  workingEndMinutes: number;

  @Enum(() => PrimaryFocusPeriod)
  @Property({ type: 'string' })
  primaryFocusPeriod: PrimaryFocusPeriod;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(data: {
    displayName: string;
    role: string;
    bio?: string | null;
    workingStartMinutes: number;
    workingEndMinutes: number;
    primaryFocusPeriod: PrimaryFocusPeriod;
  }) {
    this.displayName = UserProfile.normalizeDisplayName(data.displayName);
    this.role = UserProfile.normalizeRole(data.role);
    this.bio = data.bio ?? null;
    this.workingStartMinutes = data.workingStartMinutes;
    this.workingEndMinutes = data.workingEndMinutes;
    this.primaryFocusPeriod = data.primaryFocusPeriod;
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
