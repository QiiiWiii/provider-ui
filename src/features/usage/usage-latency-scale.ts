import type { StatusTone } from '@/lib/status-tone'

export type LatencyMetric = 'ttft' | 'total'

type LatencyScale = {
  fastMaxMs: number
  slowMinMs: number
}

const LATENCY_SCALES: Record<LatencyMetric, LatencyScale> = {
  ttft: {
    fastMaxMs: 30_000,
    slowMinMs: 60_000,
  },
  total: {
    fastMaxMs: 60_000,
    slowMinMs: 300_000,
  },
}

export function latencyTone(
  ms: number | null,
  metric: LatencyMetric,
): StatusTone | null {
  if (ms === null || ms < 0) {
    return null
  }

  const scale = LATENCY_SCALES[metric]

  if (ms < scale.fastMaxMs) {
    return 'success'
  }

  return ms < scale.slowMinMs ? 'warning' : 'danger'
}
