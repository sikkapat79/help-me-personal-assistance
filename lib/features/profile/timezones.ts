/**
 * Common IANA timezone identifiers grouped by region
 * Used for timezone selection in profile settings
 */
export const COMMON_TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Lima', label: 'Lima' },

  // Europe
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam' },
  { value: 'Europe/Stockholm', label: 'Stockholm' },
  { value: 'Europe/Zurich', label: 'Zurich' },
  { value: 'Europe/Vienna', label: 'Vienna' },
  { value: 'Europe/Dublin', label: 'Dublin' },
  { value: 'Europe/Athens', label: 'Athens' },
  { value: 'Europe/Moscow', label: 'Moscow' },

  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Jakarta', label: 'Jakarta' },
  { value: 'Asia/Manila', label: 'Manila' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Taipei', label: 'Taipei' },
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
  { value: 'Asia/Tehran', label: 'Tehran' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem' },

  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Australia/Brisbane', label: 'Brisbane' },
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Pacific/Auckland', label: 'Auckland' },

  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
] as const;

/**
 * Get a timezone label by value, or return the value itself if not found
 */
export function getTimezoneLabel(value: string): string {
  const tz = COMMON_TIMEZONES.find((tz) => tz.value === value);
  return tz?.label ?? value;
}
