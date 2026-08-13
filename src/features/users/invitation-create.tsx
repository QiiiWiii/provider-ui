import { useMutation } from '@tanstack/react-query'
import {
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  LinkIcon,
  Loader2Icon,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import type { AuthUserRole } from '@/features/auth/auth-types'
import { createInvitation } from '@/features/users/user-api'
import { apiErrorMessage } from '@/lib/api/error'

export function InvitationCreateDialog() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<AuthUserRole>('user')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )
  const invitation = useMutation({ mutationFn: createInvitation })
  const link = invitation.data
    ? `${window.location.origin}/login#invite=${encodeURIComponent(invitation.data.token)}`
    : ''

  function handleOpenChange(nextOpen: boolean) {
    if (invitation.isPending) return
    setOpen(nextOpen)
    invitation.reset()
    setRole('user')
    setCopyState('idle')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <LinkIcon />
        Create invitation link
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create invitation link</DialogTitle>
          <DialogDescription>
            Choose the account permission before sharing the link.
          </DialogDescription>
        </DialogHeader>

        {invitation.isError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Unable to create invitation</AlertTitle>
            <AlertDescription>
              {apiErrorMessage(invitation.error, 'Try again.')}
            </AlertDescription>
          </Alert>
        ) : null}

        {invitation.data ? (
          <Field>
            <FieldLabel htmlFor="invitation-link">Invitation link</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="invitation-link"
                value={link}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={
                  copyState === 'copied'
                    ? 'Invitation link copied'
                    : 'Copy invitation link'
                }
                title="Copy invitation link"
                onClick={() => void copyLink()}
              >
                {copyState === 'copied' ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            <FieldDescription>
              Creates a {role === 'super_admin' ? 'super administrator' : 'user'} account.
              Expires {formatExpiry(invitation.data.expiresAt)} and can be used once.
            </FieldDescription>
            <div role="status" aria-live="polite" aria-atomic="true">
              {copyState === 'copied' ? (
                <p className="text-sm">Invitation link copied.</p>
              ) : null}
              {copyState === 'failed' ? (
                <p className="text-sm text-destructive">
                  Clipboard access is unavailable. Select and copy the link manually.
                </p>
              ) : null}
            </div>
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor="invitation-role">Permission</FieldLabel>
            <NativeSelect
              id="invitation-role"
              className="w-full"
              value={role}
              disabled={invitation.isPending}
              onChange={(event) => setRole(event.target.value as AuthUserRole)}
            >
              <NativeSelectOption value="user">User</NativeSelectOption>
              <NativeSelectOption value="super_admin">
                Super administrator
              </NativeSelectOption>
            </NativeSelect>
            <FieldDescription>
              Super administrators can manage providers, users, and invitations.
            </FieldDescription>
          </Field>
        )}

        <DialogFooter>
          <DialogClose
            disabled={invitation.isPending}
            render={<Button variant="outline" disabled={invitation.isPending} />}
          >
            {invitation.data ? 'Done' : 'Cancel'}
          </DialogClose>
          {!invitation.data ? (
            <Button
              type="button"
              disabled={invitation.isPending}
              onClick={() => invitation.mutate({ role })}
            >
              {invitation.isPending ? <Loader2Icon className="animate-spin" /> : <LinkIcon />}
              Create link
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatExpiry(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000))
}
