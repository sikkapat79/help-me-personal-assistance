import { MorningMood } from './schema';

/**
 * Serializable check-in data for UI components
 */
export interface DailyCheckInData {
  id: string;
  checkInDate: string; // YYYY-MM-DD
  restQuality1to10: number;
  morningMood: MorningMood;
  energyBudget: number;
  sleepNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form state for check-in submission
 */
export type CheckInFormState =
  | { ok: true; message: string; warning?: string }
  | {
      ok: false;
      formError: string;
      fieldErrors?: Record<string, string>;
      values?: Partial<DailyCheckInData>;
    };
