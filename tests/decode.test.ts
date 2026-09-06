import assert from 'node:assert/strict'
import test from 'node:test'

import { optionalString } from '../src/lib/api/decode.ts'

test('optionalString treats omitted JSON keys as null', () => {
  assert.equal(optionalString(undefined, 'model alias'), null)
  assert.equal(optionalString(null, 'model alias'), null)
  assert.equal(optionalString('fast', 'model alias'), 'fast')
})

test('optionalString still rejects empty strings', () => {
  assert.throws(
    () => optionalString('', 'model alias'),
    /model alias must be a non-empty string/,
  )
})
