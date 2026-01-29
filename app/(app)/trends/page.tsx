import dayjs from 'dayjs';
import { requireActiveProfileId } from '@/lib/features/profile/activeProfile';
import { getUserProfileById } from '@/lib/features/profile/use-cases/getUserProfileById';
import { getYyyyMmDdInTimeZone } from '@/lib/time';
import { listDailyReportRows } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import type { DailyReportRow } from '@/lib/features/checkin/use-cases/listDailyReportRows';
import { SuccessCorrelationCard } from '@/app/(app)/trends/_components/SuccessCorrelationCard';

export const dynamic = 'force-dynamic';

const TRENDS_DAYS = 14;

export default async function TrendsPage() {
  const profileId = await requireActiveProfileId();
  const profileResult = await getUserProfileById(profileId);
  const timeZone = profileResult.ok
    ? (profileResult.data.timeZone ?? 'UTC')
    : 'UTC';
  const today = getYyyyMmDdInTimeZone(timeZone);
  const endDate = today;
  const startDate = dayjs(today)
    .subtract(TRENDS_DAYS - 1, 'day')
    .format('YYYY-MM-DD');

  const rows = await listDailyReportRows(profileId, startDate, endDate);
  const totalDeepFocus = rows.reduce((s, r) => s + r.deepFocusCount, 0);
  const avgDeepFocusPerDay = rows.length > 0 ? totalDeepFocus / rows.length : 0;

  return (
    <div id='trends-page' className='space-y-8'>
      <div className='view-transition-title'>
        <h1 className='text-3xl font-bold text-foreground'>BioTrends</h1>
        <p className='mt-1 text-muted-foreground'>
          Rest vs output and health log history
        </p>
      </div>

      <div className='view-transition-page space-y-8'>
        <div className='grid gap-6 sm:grid-cols-2'>
          <HealthVsOutputCard rows={rows} />
          <SuccessCorrelationCard startDate={startDate} endDate={endDate} rows={rows} />
        </div>

        <AvgDeepFocusCard avgPerDay={avgDeepFocusPerDay} />

        <HealthLogHistoryCard rows={rows} />
      </div>
    </div>
  );
}

function HealthVsOutputCard({ rows }: { rows: DailyReportRow[] }) {
  const maxTasks = Math.max(1, ...rows.map((r) => r.tasksCompletedCount));
  const maxRest = 10;

  return (
    <section
      id='health-vs-output'
      className='rounded-lg border border-border bg-card p-4'
    >
      <h2 className='text-sm font-semibold text-foreground'>
        Health vs. Output
      </h2>
      <p className='mt-0.5 text-xs text-muted-foreground'>
        Correlation of rest level to tasks completed
      </p>
      <div
        className='mt-4 flex items-end gap-1'
        aria-label='Rest and output by day'
      >
        {rows.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No check-in data in this range.
          </p>
        ) : (
          <div className='flex flex-1 flex-col gap-2'>
            {rows.map((r) => (
              <div key={r.date} className='flex items-center gap-2 text-xs'>
                <span className='w-14 shrink-0 text-muted-foreground'>
                  {dayjs(r.date).format('DD/MM')}
                </span>
                <div className='flex flex-1 gap-2'>
                  <div className='flex flex-1 items-center gap-1'>
                    <span className='sr-only'>Rest</span>
                    <div
                      className='h-4 rounded bg-slate-200'
                      style={{
                        width: `${(r.restQuality1to10 / maxRest) * 100}%`,
                        minWidth: 2,
                      }}
                      title={`Rest ${r.restQuality1to10}/10`}
                    />
                    <span className='w-4 text-muted-foreground'>
                      {r.restQuality1to10}
                    </span>
                  </div>
                  <div className='flex flex-1 items-center gap-1'>
                    <span className='sr-only'>Output</span>
                    <div
                      className='h-4 rounded bg-primary/60'
                      style={{
                        width: `${(r.tasksCompletedCount / maxTasks) * 100}%`,
                        minWidth: 2,
                      }}
                      title={`${r.tasksCompletedCount} tasks`}
                    />
                    <span className='w-4 text-muted-foreground'>
                      {r.tasksCompletedCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {rows.length > 0 && (
        <div className='mt-2 flex gap-4 text-xs text-muted-foreground'>
          <span>OUTPUT (blue)</span>
          <span>REST (grey)</span>
        </div>
      )}
    </section>
  );
}

function AvgDeepFocusCard({ avgPerDay }: { avgPerDay: number }) {
  return (
    <section
      id='avg-deep-focus'
      className='rounded-lg border border-border bg-card p-4'
    >
      <h2 className='text-sm font-semibold text-foreground'>AVG DEEP FOCUS</h2>
      <p className='mt-1 text-2xl font-medium text-foreground'>
        {avgPerDay.toFixed(1)}{' '}
        <span className='text-sm font-normal text-muted-foreground'>
          tasks/day
        </span>
      </p>
      <p className='mt-0.5 text-xs text-muted-foreground'>
        Deep focus tasks completed per day (average)
      </p>
    </section>
  );
}

function HealthLogHistoryCard({ rows }: { rows: DailyReportRow[] }) {
  return (
    <section
      id='health-log-history'
      className='rounded-lg border border-border bg-card p-4'
    >
      <h2 className='text-sm font-semibold text-foreground'>
        Health Log History
      </h2>
      <div className='mt-4 overflow-x-auto'>
        {rows.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No check-in data in this range.
          </p>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border text-left text-muted-foreground'>
                <th className='pb-2 pr-4 font-medium'>DATE</th>
                <th className='pb-2 pr-4 font-medium'>CONDITION</th>
                <th className='pb-2 pr-4 font-medium'>TASKS DONE</th>
                <th className='pb-2 font-medium'>ENERGY USED</th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((r) => (
                <tr key={r.date} className='border-b border-border/50'>
                  <td className='py-2 pr-4'>{r.date}</td>
                  <td className='py-2 pr-4'>Rest {r.restQuality1to10}/10</td>
                  <td className='py-2 pr-4'>{r.tasksCompletedCount}</td>
                  <td className='py-2'>{r.energyUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
