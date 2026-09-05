import assert from 'node:assert/strict'
import test from 'node:test'

import { formatUsageCompactCount } from '../src/features/usage/usage-format.ts'

test('compact counts stay exact below one thousand', () => {
  assert.equal(formatUsageCompactCount(0), '0')
  assert.equal(formatUsageCompactCount(12), '12')
  assert.equal(formatUsageCompactCount(999), '999')
})

test('compact counts use K and M for thousands and millions', () => {
  assert.equal(formatUsageCompactCount(1_000), '1K')
  assert.equal(formatUsageCompactCount(1_100), '1.1K')
  assert.equal(formatUsageCompactCount(10_500), '11K')
  assert.equal(formatUsageCompactCount(1_000_000), '1M')
  assert.equal(formatUsageCompactCount(1_100_000), '1.1M')
  assert.equal(formatUsageCompactCount(50_000_000), '50M')
})

test('compact counts switch to billions instead of four-digit millions', () => {
  assert.equal(formatUsageCompactCount(9_500_000_000), '9.5B')
  assert.equal(formatUsageCompactCount(13_984_000_000), '14B')
  assert.equal(formatUsageCompactCount(999_500_000), '1B')
})

test('compact counts use trillions after one thousand billions', () => {
  assert.equal(formatUsageCompactCount(1_200_000_000_000), '1.2T')
})
