import type {
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from './api-key-types'

export function createApiKeyBody(
  input: CreateApiKeyInput,
): Record<string, unknown> {
  return {
    key: input.key,
    label: input.label,
    group_labels: input.groupLabels,
    expires_at: input.expiresAt,
    quota_limit_usd: input.quotaLimitUsd,
  }
}

export function apiKeyPatchBody(
  input: UpdateApiKeyInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (input.label !== undefined) {
    body.label = input.label
  }
  if (input.groupLabels !== undefined) {
    body.group_labels = input.groupLabels
  }
  if (input.enabled !== undefined) {
    body.enabled = input.enabled
  }
  if (input.expiresAt !== undefined) {
    body.expires_at = input.expiresAt
  }
  if (input.quotaLimitUsd !== undefined) {
    body.quota_limit_usd = input.quotaLimitUsd
  }

  return body
}
