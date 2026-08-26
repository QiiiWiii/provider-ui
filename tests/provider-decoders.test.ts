import assert from 'node:assert/strict'
import test from 'node:test'

import { decodeOAuthUserCode } from '../src/features/providers/provider-oauth-code.ts'

test('Antigravity browser OAuth accepts an empty user code', () => {
  assert.equal(decodeOAuthUserCode('', 'antigravity'), '')
})

test('device OAuth providers still require a user code', () => {
  assert.throws(
    () => decodeOAuthUserCode('', 'codex'),
    /OAuth user code must be a non-empty string/,
  )
})
