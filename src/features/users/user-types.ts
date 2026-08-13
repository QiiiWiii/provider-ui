import type { AuthUserRole } from '@/features/auth/auth-types'

export type ManagedUser = {
  id: string
  username: string
  role: AuthUserRole
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export type CreatedInvitation = {
  token: string
  role: AuthUserRole
  expiresAt: number
}

export type CreateInvitationInput = {
  role: AuthUserRole
}

export type UpdateUserEnabledInput = {
  userId: string
  enabled: boolean
}

export type UpdateUserRoleInput = {
  userId: string
  role: AuthUserRole
}

export type ResetUserPasswordInput = {
  userId: string
  password: string
}
