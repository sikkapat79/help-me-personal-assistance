import { UserProfile } from '@/lib/db/entities/UserProfile';
import { UserProfileData } from './types';

/**
 * Map a UserProfile entity to UserProfileData for use in prompts and client components.
 */
export function toUserProfileData(profile: UserProfile): UserProfileData {
  return {
    id: profile.id,
    displayName: profile.displayName,
    role: profile.role,
    bio: profile.bio,
    workingStartMinutes: profile.workingStartMinutes,
    workingEndMinutes: profile.workingEndMinutes,
    primaryFocusPeriod: profile.primaryFocusPeriod,
    timeZone: profile.timeZone,
    morningPokeTimeMinutes: profile.morningPokeTimeMinutes,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
