import assert from 'node:assert/strict'
import test from 'node:test'

import { decodeUsageRequests } from '../src/features/usage/usage-decoders.ts'
import {
  formatUsageClientType,
  formatUsageEndpoint,
  formatUsageRequestStatus,
} from '../src/features/usage/usage-format.ts'

const endpoints = [
  ['openai_responses', '/v1/responses'],
  ['openai_chat_completions', '/v1/chat/completions'],
  ['claude_messages', '/v1/messages'],
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

test('usage request status is required and formatted', () => {
  const decoded = decodeUsageRequests(usageRequestsPayload('openai_responses'))
  assert.equal(decoded.total, 1)
  assert.equal(decoded.requests[0]?.status, 'succeeded')
  assert.equal(decoded.requests[0]?.clientType, 'unknown')
  assert.equal(decoded.requests[0]?.userAgent, null)
  assert.equal(formatUsageRequestStatus('succeeded'), 'Succeeded')

  const payload = usageRequestsPayload('openai_responses')
  const request = (payload.requests as Record<string, unknown>[])[0]
  request.status = 'unknown'
  assert.throws(() => decodeUsageRequests(payload), /usage request 1 status is unsupported/)
})

test('usage client types identify Claude Code app and CLI requests', () => {
  const decoded = decodeUsageRequests(
    usageRequestsPayload('claude_messages', true),
  )
  assert.equal(decoded.requests[0]?.clientType, 'claude_code')
  assert.equal(decoded.requests[0]?.userAgent, 'claude-cli/2.1.220 (external, cli)')
  assert.equal(
    formatUsageClientType(
      'claude_code',
      'claude-cli/2.1.220 (external, cli)',
    ),
    'Claude Code CLI',
  )
  assert.equal(
    formatUsageClientType(
      'claude_code',
      'claude-cli/2.1.220 (external, claude-vscode, agent-sdk/0.3.220)',
    ),
    'Claude Code app',
  )
  assert.equal(formatUsageClientType('unknown', null), 'Unknown client')
})

function usageRequestsPayload(endpoint: unknown, withClaudeClient = false) {
  return {
    page_size: 50,
    total: 1,
    requests: [
      {
        request_id: 'request-1',
        status: 'succeeded',
        endpoint,
        api_key_id: null,
        api_key_label: null,
        api_key_group_label: null,
        user_agent: withClaudeClient
          ? 'claude-cli/2.1.220 (external, cli)'
          : null,
        client_type: withClaudeClient ? 'claude_code' : 'unknown',
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
