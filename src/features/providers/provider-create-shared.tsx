import { CircleAlertIcon, Loader2Icon } from 'lucide-react'
import type { FormEventHandler, ReactNode } from 'react'
import type {
  FieldError as ReactHookFormFieldError,
  UseFormRegisterReturn,
} from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { ApiError } from '@/lib/api/error'
import { cn } from '@/lib/utils'

export function ProviderBaseFields({
  disabled,
  labelRegistration,
  groupLabelRegistration,
  visibilityRegistration,
  priorityRegistration,
  labelError,
  groupLabelError,
  visibilityError,
  priorityError,
}: {
  disabled: boolean
  labelRegistration: UseFormRegisterReturn<'label'>
  groupLabelRegistration: UseFormRegisterReturn<'groupLabel'>
  visibilityRegistration: UseFormRegisterReturn<'visibility'>
  priorityRegistration: UseFormRegisterReturn<'priority'>
  labelError?: ReactHookFormFieldError
  groupLabelError?: ReactHookFormFieldError
  visibilityError?: ReactHookFormFieldError
  priorityError?: ReactHookFormFieldError
}) {
  return (
    <>
      <Field data-invalid={Boolean(labelError)}>
        <FieldLabel htmlFor="provider-label">Label</FieldLabel>
        <Input
          id="provider-label"
          autoComplete="off"
          placeholder="My provider"
          disabled={disabled}
          aria-invalid={Boolean(labelError)}
          {...labelRegistration}
        />
        <FieldError errors={[labelError]} />
      </Field>

      <Field data-invalid={Boolean(groupLabelError)}>
        <FieldLabel htmlFor="provider-group-label">Provider group</FieldLabel>
        <Input
          id="provider-group-label"
          autoComplete="off"
          placeholder="shared-codex"
          disabled={disabled}
          aria-invalid={Boolean(groupLabelError)}
          {...groupLabelRegistration}
        />
        <FieldDescription>Used by API keys for routing.</FieldDescription>
        <FieldError errors={[groupLabelError]} />
      </Field>

      <Field data-invalid={Boolean(visibilityError)}>
        <FieldLabel htmlFor="provider-visibility">Visibility</FieldLabel>
        <NativeSelect
          id="provider-visibility"
          className="w-full"
          disabled={disabled}
          aria-invalid={Boolean(visibilityError)}
          {...visibilityRegistration}
        >
          <NativeSelectOption value="private">Private</NativeSelectOption>
          <NativeSelectOption value="shared">Shared</NativeSelectOption>
        </NativeSelect>
        <FieldDescription>Shared with all users; editable by the owner.</FieldDescription>
        <FieldError errors={[visibilityError]} />
      </Field>

      <Field data-invalid={Boolean(priorityError)}>
        <FieldLabel htmlFor="provider-priority">Priority</FieldLabel>
        <Input
          id="provider-priority"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={Boolean(priorityError)}
          {...priorityRegistration}
        />
        <FieldDescription>Lower numbers route first.</FieldDescription>
        <FieldError errors={[priorityError]} />
      </Field>
    </>
  )
}

// The popup is capped at the viewport, so every step scrolls its own body and
// leaves the header and the action row in place. Both bleed out to the popup
// edge and re-apply its padding, the only way to reach that edge from inside.
// The vertical pair nets out and buys 4px of clipping room for focus outlines.
export function ProviderCreateBody({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-6 -my-1 grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 py-1">
      {children}
    </div>
  )
}

export function ProviderCreateFooter({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <DialogFooter className={cn('-mx-6 -mb-6 px-6 py-4', className)}>
      {children}
    </DialogFooter>
  )
}

// The submit button sits in the footer, outside the form it submits, so the
// action row stays pinned while the fields scroll. `form` ties them together.
export function ProviderCreateForm({
  formId,
  submitLabel,
  pending,
  error,
  onSubmit,
  children,
}: {
  formId: string
  submitLabel: string
  pending: boolean
  error: unknown
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
}) {
  return (
    <>
      <ProviderCreateBody>
        {error ? <ProviderMutationError error={error} /> : null}
        <form id={formId} onSubmit={onSubmit}>
          <FieldGroup>{children}</FieldGroup>
        </form>
      </ProviderCreateBody>

      <ProviderCreateFooter>
        <DialogClose
          disabled={pending}
          render={<Button variant="outline" disabled={pending} />}
        >
          Cancel
        </DialogClose>
        <Button type="submit" form={formId} disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </ProviderCreateFooter>
    </>
  )
}

function ProviderMutationError({ error }: { error: unknown }) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>Unable to create provider</AlertTitle>
      <AlertDescription>
        {error instanceof ApiError
          ? error.message
          : 'The provider could not be created. Try again.'}
      </AlertDescription>
    </Alert>
  )
}
