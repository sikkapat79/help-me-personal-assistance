import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Safely get timezone string, falling back to UTC if invalid/empty
 */
export function safeTimeZoneOrUtc(timeZone: string | null | undefined): string {
  if (!timeZone?.trim()) {
    return 'UTC';
  }
  const trimmed = timeZone.trim();
  // Basic validation: check if dayjs can parse it
  try {
    dayjs().tz(trimmed);
    return trimmed;
  } catch {
    return 'UTC';
  }
}

/**
 * Get today's date in YYYY-MM-DD format in the given timezone
 */
export function getYyyyMmDdInTimeZone(timeZone: string): string {
  const tz = safeTimeZoneOrUtc(timeZone);
  return dayjs().tz(tz).format('YYYY-MM-DD');
}

/**
 * Get minutes since midnight (0-1439) in the given timezone
 */
export function getMinutesSinceMidnightInTimeZone(timeZone: string): number {
  const tz = safeTimeZoneOrUtc(timeZone);
  const now = dayjs().tz(tz);
  return now.hour() * 60 + now.minute();
}
