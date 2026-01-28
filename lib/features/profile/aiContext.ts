import { UserProfileData, formatTimeFromMinutes } from './types';

/**
 * Convert a user profile into a structured context string for AI prompts
 * Use this server-side only when calling Bedrock for prioritization/planning
 */
export function toProfilePromptContext(profile: UserProfileData): string {
  const workingStart = formatTimeFromMinutes(profile.workingStartMinutes);
  const workingEnd = formatTimeFromMinutes(profile.workingEndMinutes);

  let context = `User Profile:
- Name: ${profile.displayName}
- Role: ${profile.role}
- Working Hours: ${workingStart} to ${workingEnd}
- Primary Focus Period: ${profile.primaryFocusPeriod}`;

  if (profile.bio) {
    context += `\n- About: ${profile.bio}`;
  }

  return context;
}
