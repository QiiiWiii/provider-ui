export type DashboardQuotaSummary =
  | 'ok'
  | 'low'
  | 'exhausted'
  | 'unsupported'
  | 'unavailable'
  | 'unknown'

export type DashboardRange = {
  fromMs: number
  toMs: number
}

export type DashboardQuota = {
  summary: DashboardQuotaSummary
  tightestRemainingPercent: number | null
  fetchedAtMs: number | null
}

export type DashboardAccountMetrics = {
  accountId: string
  provider: ProviderKind
  label: string
  groupLabel: string
  visibility: 'private' | 'shared'
  enabled: boolean
  authState: 'active' | 'reauth_required'
  requests: number
  successes: number
  failures: number
  successRate: number | null
  ttftP50Ms: number | null
  ttftP95Ms: number | null
  durationP95Ms: number | null
  quota: DashboardQuota
}

export type DashboardModelMetrics = {
  model: string
  requests: number
  successes: number
  failures: number
  successRate: number | null
  tokens: {
    effectiveInput: number
    output: number
  }
  ttftP50Ms: number | null
}

export type DashboardSeries = {
  bucketMs: number
  buckets: number[]
  requests: number[]
  failures: number[]
}

export type DashboardFailureLayers = {
  upstreamFailedRequests: number
  zeroDispatchLogicalFailures: number
}

export type DashboardAccountCounts = {
  total: number
  enabled: number
  active: number
  reauthRequired: number
  disabled: number
}

export type DashboardOverview = {
  fromMs: number
  toMs: number
  requests: number
  successes: number
  failures: number
  successRate: number | null
  tokens: {
    cacheReadInput: number
    effectiveInput: number
    output: number
    total: number
  }
  totalTokens: {
    cacheReadInput: number
    effectiveInput: number
    output: number
    total: number
  }
  costUsd: string | null
  avgResponseMs: number | null
  ttftP50Ms: number | null
  ttftP95Ms: number | null
  accounts: DashboardAccountCounts
  failureLayers: DashboardFailureLayers
  groups: string[]
}

export type DashboardProviders = {
  fromMs: number
  toMs: number
  accounts: DashboardAccountMetrics[]
  groups: string[]
  models: DashboardModelMetrics[]
  series: DashboardSeries
  failureLayers: DashboardFailureLayers
}
import type { ProviderKind } from '../providers/provider-types.ts'
