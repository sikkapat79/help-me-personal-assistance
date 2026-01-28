import { PrimaryFocusPeriod } from './schema';

// Serializable type for passing profile data to client components
export interface UserProfileData {
  id: string;
  displayName: string;
  role: string;
  bio: string | null;
  workingStartMinutes: number;
  workingEndMinutes: number;
  primaryFocusPeriod: PrimaryFocusPeriod;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to format time from minutes since midnight (0-1439)
export function formatTimeFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper to parse time string (HH:MM) to minutes since midnight
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
