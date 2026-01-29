/**
 * Route order for scroll direction: higher index = "forward".
 * Used to compute transition direction (new from right vs from left).
 */
const ROUTE_ORDER = ['/', '/tasks', '/trends', '/calibration', '/checkin'];

function pathnameOnly(path: string): string {
  const withoutQuery = path.split('?')[0];
  return withoutQuery.endsWith('/') && withoutQuery.length > 1
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
}

function routeIndex(path: string): number {
  const normalized = pathnameOnly(path);
  const index = ROUTE_ORDER.indexOf(normalized);
  return Math.max(0, index);
}

/**
 * Returns 'forward' (new page from right) or 'back' (new page from left)
 * based on route order. Used for view transition slide direction.
 */
export function getTransitionDirection(
  fromPath: string,
  toPath: string,
): 'forward' | 'back' {
  const fromIdx = routeIndex(fromPath);
  const toIdx = routeIndex(toPath);
  return toIdx > fromIdx ? 'forward' : 'back';
}
