import type { OAuthProviderKind } from './provider-types'

export function decodeOAuthUserCode(
  value: unknown,
  provider: OAuthProviderKind,
): string {
  if (provider === 'antigravity' || provider === 'claude_oauth') {
    if (typeof value !== 'string') {
      throw new TypeError('OAuth user code must be a string')
    }
    return value
  }

  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError('OAuth user code must be a non-empty string')
  }
  return value
}
