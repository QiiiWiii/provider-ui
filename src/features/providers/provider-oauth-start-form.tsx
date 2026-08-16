import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { startProviderOAuth } from '@/features/providers/provider-api'
import {
  ProviderBaseFields,
  ProviderCreateForm,
} from '@/features/providers/provider-create-shared'
import {
  defaultBaseValues,
  providerBaseSchema,
  type ProviderBaseValues,
} from '@/features/providers/provider-create-schema'
import { providerKeys } from '@/features/providers/providers-query'
import type { OAuthProviderKind } from '@/features/providers/provider-types'

export function ProviderOAuthStartForm({
  provider,
  onSessionStarted,
}: {
  provider: OAuthProviderKind
  onSessionStarted: (sessionId: string) => void
}) {
  const form = useForm<ProviderBaseValues>({
    resolver: zodResolver(providerBaseSchema),
    defaultValues: defaultBaseValues,
  })
  const startOAuth = useMutation({
    mutationKey: providerKeys.create,
    mutationFn: startProviderOAuth,
    onSuccess: (session) => onSessionStarted(session.id),
  })

  return (
    <ProviderCreateForm
      formId="provider-oauth-form"
      submitLabel="Start authorization"
      pending={startOAuth.isPending}
      error={startOAuth.error}
      onSubmit={form.handleSubmit((values) =>
        startOAuth.mutate({ ...values, provider }),
      )}
    >
      <ProviderBaseFields
        disabled={startOAuth.isPending}
        labelRegistration={form.register('label')}
        groupLabelRegistration={form.register('groupLabel')}
        visibilityRegistration={form.register('visibility')}
        priorityRegistration={form.register('priority', {
          valueAsNumber: true,
        })}
        labelError={form.formState.errors.label}
        groupLabelError={form.formState.errors.groupLabel}
        visibilityError={form.formState.errors.visibility}
        priorityError={form.formState.errors.priority}
      />
    </ProviderCreateForm>
  )
}
