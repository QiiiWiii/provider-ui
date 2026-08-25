import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createCompatibleProviderBody,
  importOAuthProviderBody,
  startProviderOAuthBody,
  updateProviderAccountBody,
} from '../src/features/providers/provider-payload.ts'

test('provider creation payloads include priority', () => {
  assert.deepEqual(
    createCompatibleProviderBody({
      provider: 'openai_compatible',
      label: 'OpenAI compatible',
      groupLabel: 'default',
      priority: 12,
      visibility: 'private',
      baseUrl: 'https://api.example.com/v1',
      upstreamProtocol: 'responses',
      apiKey: 'secret',
    }),
    {
      method: 'direct',
      provider: 'openai_compatible',
      label: 'OpenAI compatible',
      group_label: 'default',
      priority: 12,
      base_url: 'https://api.example.com/v1',
      upstream_protocol: 'responses',
      api_key: 'secret',
      visibility: 'private',
    },
  )

  assert.deepEqual(
    createCompatibleProviderBody({
      provider: 'anthropic_compatible',
      label: 'Anthropic compatible',
      groupLabel: 'default',
      priority: 8,
      visibility: 'shared',
      baseUrl: 'https://api.anthropic.example.com',
      apiKey: 'secret',
    }),
    {
      method: 'direct',
      provider: 'anthropic_compatible',
      label: 'Anthropic compatible',
      group_label: 'default',
      priority: 8,
      base_url: 'https://api.anthropic.example.com',
      api_key: 'secret',
      visibility: 'shared',
    },
  )

  assert.deepEqual(
    importOAuthProviderBody({
      provider: 'codex',
      label: 'Codex import',
      groupLabel: 'default',
      priority: 7,
      visibility: 'shared',
      credentialJson: { type: 'codex' },
    }),
    {
      method: 'credential_json',
      provider: 'codex',
      label: 'Codex import',
      group_label: 'default',
      priority: 7,
      credential_json: { type: 'codex' },
      visibility: 'shared',
    },
  )

  assert.deepEqual(
    importOAuthProviderBody({
      provider: 'antigravity',
      label: 'Antigravity import',
      groupLabel: 'google',
      priority: 9,
      visibility: 'private',
      credentialJson: { type: 'antigravity' },
    }),
    {
      method: 'credential_json',
      provider: 'antigravity',
      label: 'Antigravity import',
      group_label: 'google',
      priority: 9,
      credential_json: { type: 'antigravity' },
      visibility: 'private',
    },
  )

  assert.deepEqual(
    startProviderOAuthBody({
      provider: 'grok',
      label: 'Grok OAuth',
      groupLabel: 'default',
      priority: 3,
      visibility: 'private',
    }),
    {
      provider: 'grok',
      label: 'Grok OAuth',
      group_label: 'default',
      priority: 3,
      visibility: 'private',
    },
  )

  assert.deepEqual(
    startProviderOAuthBody({
      provider: 'antigravity',
      label: 'Antigravity OAuth',
      groupLabel: 'google',
      priority: 4,
      visibility: 'shared',
    }),
    {
      provider: 'antigravity',
      label: 'Antigravity OAuth',
      group_label: 'google',
      priority: 4,
      visibility: 'shared',
    },
  )
})

test('provider update payload includes priority and omits a blank API key', () => {
  assert.deepEqual(
    updateProviderAccountBody({
      accountId: 'provider-1',
      label: 'Updated',
      groupLabel: 'priority-group',
      priority: 42,
      visibility: 'shared',
      baseUrl: 'https://api.example.com',
      upstreamProtocol: 'chat_completions',
      apiKey: '   ',
    }),
    {
      label: 'Updated',
      group_label: 'priority-group',
      priority: 42,
      visibility: 'shared',
      base_url: 'https://api.example.com',
      upstream_protocol: 'chat_completions',
    },
  )
})
