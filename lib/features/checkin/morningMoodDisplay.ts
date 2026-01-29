import { MorningMood } from './schema';

/** Single source of truth for mood label + emoji (reduces cognitive load). */
const DISPLAY: Record<MorningMood, string> = {
  [MorningMood.Fresh]: 'Fresh ✨',
  [MorningMood.Neutral]: 'Neutral 🙂',
  [MorningMood.Tired]: 'Tired 😴',
  [MorningMood.Taxed]: 'Taxed 😓',
};

export function getMorningMoodDisplay(mood: MorningMood): string {
  return DISPLAY[mood] ?? mood;
}
