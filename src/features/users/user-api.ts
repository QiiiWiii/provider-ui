import {
  requestAuthenticatedData,
  requestAuthenticatedEmpty,
} from '@/features/auth/authenticated-request'
import {
  decodeCreatedInvitation,
  decodeManagedUser,
  decodeManagedUsers,
} from '@/features/users/user-decoders'
import type {
  CreatedInvitation,
  CreateInvitationInput,
  ManagedUser,
  ResetUserPasswordInput,
  UpdateUserEnabledInput,
  UpdateUserRoleInput,
} from '@/features/users/user-types'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export function getUsers(): Promise<ManagedUser[]> {
  return requestAuthenticatedData('/api/v1/users', decodeManagedUsers)
}

export function createInvitation(
  input: CreateInvitationInput,
): Promise<CreatedInvitation> {
  return requestAuthenticatedData(
    '/api/v1/invitations',
    decodeCreatedInvitation,
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ role: input.role }),
    },
  )
}

export function updateUserEnabled(
  input: UpdateUserEnabledInput,
): Promise<ManagedUser> {
  return requestAuthenticatedData(
    userEndpoint(input.userId),
    decodeManagedUser,
    {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        enabled: input.enabled,
      }),
    },
  )
}

export function updateUserRole(
  input: UpdateUserRoleInput,
): Promise<ManagedUser> {
  return requestAuthenticatedData(
    `${userEndpoint(input.userId)}/role`,
    decodeManagedUser,
    {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ role: input.role }),
    },
  )
}

export function resetUserPassword(
  input: ResetUserPasswordInput,
): Promise<ManagedUser> {
  return requestAuthenticatedData(
    `${userEndpoint(input.userId)}/password`,
    decodeManagedUser,
    {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        password: input.password,
      }),
    },
  )
}

export function deleteUser(userId: string): Promise<void> {
  return requestAuthenticatedEmpty(userEndpoint(userId), {
    method: 'DELETE',
  })
}

function userEndpoint(userId: string): string {
  return `/api/v1/users/${encodeURIComponent(userId)}`
}
