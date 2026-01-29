import { MorningMood } from './schema';

/**
 * Suggest an energy budget based on rest quality and morning mood
 *
 * Base calculation: linear map from restQuality (1-10) to energy budget (20-100)
 * Mood adjustment:
 * - Fresh: +10%
 * - Tired: no adjustment
 * - Taxed: -15%
 *
 * @param restQuality1to10 - Rest quality rating (1-10)
 * @param morningMood - Morning mood after waking
 * @returns Suggested energy budget (integer)
 */
export function suggestEnergyBudget(
  restQuality1to10: number,
  morningMood: MorningMood,
): number {
  // Base mapping: 1 → 20, 10 → 100 (linear)
  const baseEnergy = 20 + ((restQuality1to10 - 1) / 9) * 80;

  // Mood adjustment multiplier
  let moodMultiplier = 1.0;
  switch (morningMood) {
    case MorningMood.Fresh:
      moodMultiplier = 1.1; // +10%
      break;
    case MorningMood.Neutral:
    case MorningMood.Tired:
      moodMultiplier = 1.0; // no adjustment
      break;
    case MorningMood.Taxed:
      moodMultiplier = 0.85; // -15%
      break;
  }

  // Apply mood adjustment and round to integer
  const suggestedEnergy = Math.round(baseEnergy * moodMultiplier);

  // Clamp to reasonable range [10, 120]
  return Math.max(10, Math.min(120, suggestedEnergy));
}
