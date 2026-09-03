import assert from 'node:assert/strict'
import test from 'node:test'

import { decodeApiKey } from '../src/features/api-keys/api-key-decoders.ts'

const summary = {
  id: 'key-1',
  owner_user_id: 'user-1',
  label: 'CI',
  key: 'pod***XYZ',
  enabled: true,
  expires_at: null,
  quota_limit_usd: null,
  spent_usd: '0',
  last_used_at: null,
  created_at: 1,
  updated_at: 1,
}

test('API key decoder reads group_labels and rejects the old field', () => {
  const decoded = decodeApiKey({
    ...summary,
    group_labels: ['shared', 'claude'],
  })
  assert.deepEqual(decoded.groupLabels, ['shared', 'claude'])

  assert.throws(
    () => decodeApiKey({ ...summary, group_label: 'shared' }),
    /API key group labels must be an array/,
  )
  assert.throws(
    () => decodeApiKey({ ...summary, group_labels: [] }),
    /must contain at least one group/,
  )
})
