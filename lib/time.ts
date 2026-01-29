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

/**
 * Get today's start and end as Date in the given timezone (for DB range queries).
 */
export function getTodayStartEndInTimeZone(timeZone: string): {
  start: Date;
  end: Date;
} {
  const tz = safeTimeZoneOrUtc(timeZone);
  const start = dayjs().tz(tz).startOf('day').toDate();
  const end = dayjs().tz(tz).endOf('day').toDate();
  return { start, end };
}

/**
 * Whether a due date falls on or before today (YYYY-MM-DD) in the given timezone.
 * Use for "today + overdue" filtering. Callers must exclude dueAt == null.
 */
export function isDueOnOrBefore(
  dueAt: Date,
  todayYyyyMmDd: string,
  timeZone: string,
): boolean {
  const tz = safeTimeZoneOrUtc(timeZone);
  const dueYyyyMmDd = dayjs(dueAt).tz(tz).format('YYYY-MM-DD');
  return dueYyyyMmDd <= todayYyyyMmDd;
}
