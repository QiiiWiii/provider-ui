import { authUserRoles } from '@/features/auth/auth-decoders'
import type {
  CreatedInvitation,
  ManagedUser,
} from '@/features/users/user-types'
import {
  requireArray,
  requireBoolean,
  requireEnum,
  requireNonEmptyString,
  requireRecord,
  requireTimestamp,
} from '@/lib/api/decode'

export function decodeManagedUsers(value: unknown): ManagedUser[] {
  return requireArray(value, 'users').map((user, index) =>
    decodeManagedUser(user, `user ${index + 1}`),
  )
}

export function decodeCreatedInvitation(
  value: unknown,
): CreatedInvitation {
  const record = requireRecord(value, 'invitation')

  return {
    token: requireNonEmptyString(record.token, 'invitation token'),
    role: requireEnum(record.role, authUserRoles, 'invitation role'),
    expiresAt: requireTimestamp(
      record.expires_at,
      'invitation expiration',
    ),
  }
}

export function decodeManagedUser(
  value: unknown,
  label = 'user',
): ManagedUser {
  const record = requireRecord(value, label)

  return {
    id: requireNonEmptyString(record.id, `${label} ID`),
    username: requireNonEmptyString(record.username, `${label} username`),
    role: requireEnum(record.role, authUserRoles, `${label} role`),
    enabled: requireBoolean(record.enabled, `${label} enabled state`),
    createdAt: requireTimestamp(record.created_at, `${label} creation time`),
    updatedAt: requireTimestamp(record.updated_at, `${label} update time`),
  }
}
