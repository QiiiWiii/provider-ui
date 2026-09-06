import assert from 'node:assert/strict'
import test from 'node:test'

import { findPrimaryBalance } from '../src/features/providers/provider-quota-metrics.ts'
import type { ProviderQuota } from '../src/features/providers/provider-types.ts'

function quota(
  groups: NonNullable<ProviderQuota['snapshot']>['groups'],
): ProviderQuota {
  return {
    support: 'supported',
    freshness: 'fresh',
    snapshot: {
      accountId: 'account-1',
      provider: 'antigravity',
      fetchedAt: 1,
      groups,
      warnings: [],
    },
    lastError: null,
    estimate: null,
  }
}

test('finds a billing balance for subscription quota summaries', () => {
  const result = findPrimaryBalance(
    quota([
      {
        key: 'antigravity_credits',
        scope: 'billing',
        attributes: {},
        metrics: [
          {
            key: 'credits',
            kind: 'balance',
            unit: 'credits',
            used: null,
            remaining: 25000,
            limit: null,
            period: null,
            breakdown: [],
          },
        ],
      },
    ]),
  )

  assert.equal(result?.metric.remaining, 25000)
})

test('does not treat usage metrics as a billing balance', () => {
  assert.equal(
    findPrimaryBalance(
      quota([
        {
          key: 'usage',
          scope: 'aggregate',
          attributes: {},
          metrics: [
            {
              key: 'primary',
              kind: 'usage',
              unit: 'percent',
              used: 20,
              remaining: 80,
              limit: 100,
              period: null,
              breakdown: [],
            },
          ],
        },
      ]),
    ),
    null,
  )
})
