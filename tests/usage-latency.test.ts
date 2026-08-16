import assert from 'node:assert/strict'
import test from 'node:test'

import {
  elapsedLatencyMs,
  formatUsageLatencyMs,
  totalLatencyMs,
} from '../src/features/usage/usage-latency-format.ts'
import { latencyTone } from '../src/features/usage/usage-latency-scale.ts'

test('missing first-token time stays unknown instead of using total latency', () => {
  const startedAtMs = 1_000
  const completedAtMs = 1_007

  assert.equal(elapsedLatencyMs(startedAtMs, null), null)
  assert.equal(formatUsageLatencyMs(null), '—')
  assert.equal(totalLatencyMs(startedAtMs, completedAtMs), 7)
  assert.equal(formatUsageLatencyMs(7), '7ms')
})

test('first-token and total latency are calculated independently', () => {
  const startedAtMs = 1_000

  assert.equal(elapsedLatencyMs(startedAtMs, 1_125), 125)
  assert.equal(totalLatencyMs(startedAtMs, 1_840), 840)
})

test('TTFT and total latency use independent status scales', () => {
  assert.equal(latencyTone(100, 'ttft'), 'success')
  assert.equal(latencyTone(100, 'total'), 'success')
  assert.equal(latencyTone(300_000, 'ttft'), 'danger')
  assert.equal(latencyTone(300_000, 'total'), 'danger')
})

test('unknown and negative latency carry no tone', () => {
  assert.equal(latencyTone(null, 'ttft'), null)
  assert.equal(latencyTone(-1, 'total'), null)
})

test('latency status moves from success to warning to danger', () => {
  assert.equal(latencyTone(29_999, 'ttft'), 'success')
  assert.equal(latencyTone(30_000, 'ttft'), 'warning')
  assert.equal(latencyTone(59_999, 'ttft'), 'warning')
  assert.equal(latencyTone(60_000, 'ttft'), 'danger')
  assert.equal(latencyTone(59_999, 'total'), 'success')
  assert.equal(latencyTone(60_000, 'total'), 'warning')
  assert.equal(latencyTone(299_999, 'total'), 'warning')
  assert.equal(latencyTone(300_000, 'total'), 'danger')
})
