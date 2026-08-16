import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { createCompatibleProvider } from '@/features/providers/provider-api'
import {
  ProviderBaseFields,
  ProviderCreateForm,
} from '@/features/providers/provider-create-shared'
import {
  compatibleProviderSchema,
  defaultBaseValues,
  type CompatibleProviderValues,
} from '@/features/providers/provider-create-schema'
import { providerKeys } from '@/features/providers/providers-query'
import type { CompatibleProviderKind } from '@/features/providers/provider-types'
import { useFinishProviderCreation } from '@/features/providers/use-finish-provider-creation'

export function CompatibleProviderForm({
  provider,
}: {
  provider: CompatibleProviderKind
}) {
  const finishCreation = useFinishProviderCreation()
  const form = useForm<CompatibleProviderValues>({
    resolver: zodResolver(compatibleProviderSchema),
    defaultValues: {
      ...defaultBaseValues,
      baseUrl: '',
      apiKey: '',
      upstreamProtocol: 'chat_completions',
    },
  })
  const createProvider = useMutation({
    mutationKey: providerKeys.create,
    mutationFn: createCompatibleProvider,
    onSuccess: finishCreation,
  })

  return (
    <ProviderCreateForm
      formId="compatible-provider-form"
      submitLabel="Create provider"
      pending={createProvider.isPending}
      error={createProvider.error}
      onSubmit={form.handleSubmit((values) => {
        const commonInput = {
          label: values.label,
          groupLabel: values.groupLabel,
          visibility: values.visibility,
          priority: values.priority,
          baseUrl: values.baseUrl,
          apiKey: values.apiKey,
        }

        if (provider === 'openai_compatible') {
          createProvider.mutate({
            ...commonInput,
            provider,
            upstreamProtocol: values.upstreamProtocol,
          })
          return
        }

        createProvider.mutate({ ...commonInput, provider })
      })}
    >
      <ProviderBaseFields
        disabled={createProvider.isPending}
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

      <Field data-invalid={Boolean(form.formState.errors.baseUrl)}>
        <FieldLabel htmlFor="provider-base-url">Base URL</FieldLabel>
        <Input
          id="provider-base-url"
          type="url"
          placeholder={
            provider === 'openai_compatible'
              ? 'https://api.example.com/v1'
              : 'https://api.example.com'
          }
          autoComplete="url"
          disabled={createProvider.isPending}
          aria-invalid={Boolean(form.formState.errors.baseUrl)}
          {...form.register('baseUrl')}
        />
        <FieldDescription>HTTP and HTTPS are supported.</FieldDescription>
        <FieldError errors={[form.formState.errors.baseUrl]} />
      </Field>

      <Field data-invalid={Boolean(form.formState.errors.apiKey)}>
        <FieldLabel htmlFor="provider-api-key">API Key</FieldLabel>
        <Input
          id="provider-api-key"
          type="password"
          autoComplete="off"
          disabled={createProvider.isPending}
          aria-invalid={Boolean(form.formState.errors.apiKey)}
          {...form.register('apiKey')}
        />
        <FieldError errors={[form.formState.errors.apiKey]} />
      </Field>

      {provider === 'openai_compatible' ? (
        <Field data-invalid={Boolean(form.formState.errors.upstreamProtocol)}>
          <FieldLabel htmlFor="provider-upstream-protocol">
            Upstream API
          </FieldLabel>
          <NativeSelect
            id="provider-upstream-protocol"
            className="w-full"
            disabled={createProvider.isPending}
            aria-invalid={Boolean(form.formState.errors.upstreamProtocol)}
            {...form.register('upstreamProtocol')}
          >
            <NativeSelectOption value="chat_completions">
              Chat Completions
            </NativeSelectOption>
            <NativeSelectOption value="responses">Responses</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[form.formState.errors.upstreamProtocol]} />
        </Field>
      ) : null}
    </ProviderCreateForm>
  )
}
