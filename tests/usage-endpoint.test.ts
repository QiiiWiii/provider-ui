import assert from 'node:assert/strict'
import test from 'node:test'

import { decodeUsageRequests } from '../src/features/usage/usage-decoders.ts'
import { formatUsageEndpoint } from '../src/features/usage/usage-format.ts'

const endpoints = [
  ['openai_responses', 'Responses'],
  ['openai_chat_completions', 'Chat Completions'],
  ['claude_messages', 'Messages'],
] as const

test('usage request endpoints are decoded and formatted', () => {
  for (const [endpoint, label] of endpoints) {
    const decoded = decodeUsageRequests(usageRequestsPayload(endpoint))

    assert.equal(decoded.requests[0]?.endpoint, endpoint)
    assert.equal(formatUsageEndpoint(endpoint), label)
  }
})

test('missing historical endpoint remains unknown', () => {
  const payload = usageRequestsPayload(null)
  const request = (payload.requests as Record<string, unknown>[])[0]
  delete request.endpoint

  const decoded = decodeUsageRequests(payload)

  assert.equal(decoded.requests[0]?.endpoint, null)
  assert.equal(formatUsageEndpoint(null), '—')
})

test('unknown non-null endpoint violates the usage API contract', () => {
  assert.throws(
    () => decodeUsageRequests(usageRequestsPayload('legacy_chat')),
    /usage request 1 endpoint is unsupported/,
  )
})

function usageRequestsPayload(endpoint: unknown) {
  return {
    page_size: 50,
    requests: [
      {
        request_id: 'request-1',
        endpoint,
        api_key_id: null,
        api_key_label: null,
        api_key_group_label: null,
        client_model: 'example-model',
        reasoning_effort: null,
        started_at_ms: 1_000,
        completed_at_ms: 2_000,
        first_token_at_ms: 1_500,
        tokens: {
          effective_input: 10,
          cache_read_input: 0,
          output: 5,
        },
        cost: { usd: '0.000001' },
      },
    ],
    next_cursor: null,
  }
}
