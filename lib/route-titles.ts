/**
 * Pathname to page title/subtitle for loading state.
 * Keeps loading UI title in the same position as real page titles.
 */
const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Today', subtitle: 'Your tasks for today' },
  '/tasks': {
    title: 'All tasks',
    subtitle: 'View and manage all your tasks, sorted by deadline',
  },
  '/trends': {
    title: 'BioTrends',
    subtitle: 'Rest vs output and health log history',
  },
  '/calibration': {
    title: 'Calibration',
    subtitle: 'Configure your profile and working preferences',
  },
  '/checkin': {
    title: 'Morning Check-in',
    subtitle: 'Set your energy plan for today based on your rest and mood',
  },
};

function pathnameOnly(path: string): string {
  const withoutQuery = path.split('?')[0];
  return withoutQuery.endsWith('/') && withoutQuery.length > 1
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
}

export function getPageTitleForPath(pathname: string): {
  title: string;
  subtitle?: string;
} {
  const normalized = pathnameOnly(pathname);
  return (
    ROUTE_TITLES[normalized] ?? { title: 'Loading...', subtitle: undefined }
  );
}
