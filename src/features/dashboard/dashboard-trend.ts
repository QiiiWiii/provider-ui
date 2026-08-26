import type { DashboardSeries } from './dashboard-types.ts'

const hourFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const dayFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export type DashboardTrendPoint = {
  bucket: string
  requests: number
  failures: number
}

export function buildDashboardTrendData(
  series: DashboardSeries,
): DashboardTrendPoint[] {
  return series.buckets.map((bucket, index) => ({
    bucket: String(bucket),
    requests: series.requests[index] ?? 0,
    failures: series.failures[index] ?? 0,
  }))
}

export function formatDashboardTrendTick(
  value: string | number,
  showDayLabels: boolean,
): string {
  const date = dashboardTrendDate(value)
  if (!date) return String(value)

  return showDayLabels ? dayFormatter.format(date) : hourFormatter.format(date)
}

export function formatDashboardTrendTooltip(
  value: string | number,
  showDayLabels: boolean,
): string {
  const date = dashboardTrendDate(value)
  if (!date) return String(value)

  return showDayLabels
    ? `${dayFormatter.format(date)} · ${hourFormatter.format(date)}`
    : hourFormatter.format(date)
}

function dashboardTrendDate(value: string | number): Date | null {
  const timestamp = typeof value === 'number' ? value : Number(value)
  if (!Number.isSafeInteger(timestamp)) return null

  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}
