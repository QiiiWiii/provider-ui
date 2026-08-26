import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDashboardTrendData,
  formatDashboardTrendTick,
  formatDashboardTrendTooltip,
} from '../src/features/dashboard/dashboard-trend.ts'
import type { DashboardSeries } from '../src/features/dashboard/dashboard-types.ts'

test('dashboard trend keeps every hourly bucket addressable by its tooltip', () => {
  const series: DashboardSeries = {
    bucketMs: 3_600_000,
    buckets: [Date.UTC(2026, 7, 25, 0), Date.UTC(2026, 7, 25, 1)],
    requests: [0, 7],
    failures: [0, 1],
  }

  const data = buildDashboardTrendData(series)

  assert.deepEqual(
    data.map((point) => point.bucket),
    series.buckets.map(String),
  )
  assert.equal(new Set(data.map((point) => point.bucket)).size, 2)
  assert.equal(data[1]?.requests, 7)
  assert.equal(data[1]?.failures, 1)
})

test('dashboard trend tooltip labels retain the hour for multi-day ranges', () => {
  const bucket = Date.UTC(2026, 7, 25, 13)
  const tooltip = formatDashboardTrendTooltip(String(bucket), true)

  assert.notEqual(
    tooltip,
    formatDashboardTrendTooltip(String(bucket), false),
  )
  assert.doesNotMatch(tooltip, /\b(?:AM|PM)\b/i)
  assert.notEqual(
    formatDashboardTrendTick(String(bucket), true),
    tooltip,
  )
})
