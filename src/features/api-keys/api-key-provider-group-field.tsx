import { Loader2Icon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import type { ProviderGroupCatalog } from '@/features/api-keys/provider-group-options'

export function ApiKeyProviderGroupField({
  id,
  value,
  onChange,
  catalog,
  currentGroups = [],
  disabled,
  invalid,
}: {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  catalog: ProviderGroupCatalog
  currentGroups?: readonly string[]
  disabled: boolean
  invalid: boolean
}) {
  const anchor = useComboboxAnchor()
  const extra = currentGroups.filter(
    (group) => !catalog.values.includes(group) && value.includes(group),
  )
  const choices = [...extra, ...catalog.values]
  const selectionDisabled =
    disabled || catalog.status !== 'ready' || catalog.values.length === 0
  const currentUnavailable = extra.length > 0

  return (
    <>
      <Combobox
        multiple
        value={value}
        onValueChange={onChange}
        disabled={selectionDisabled}
      >
        <ComboboxChips ref={anchor} aria-invalid={invalid} className="w-full">
          {value.map((group) => (
            <ComboboxChip key={group}>{group}</ComboboxChip>
          ))}
          <ComboboxChipsInput
            id={id}
            placeholder={
              value.length === 0 ? providerGroupPlaceholder(catalog) : undefined
            }
            disabled={selectionDisabled}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No matching groups</ComboboxEmpty>
          <ComboboxList>
            {choices.map((group) => {
              const available = catalog.values.includes(group)
              return (
                <ComboboxItem key={group} value={group} disabled={!available}>
                  {available ? group : group + ' (unavailable)'}
                </ComboboxItem>
              )
            })}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <ProviderGroupStatus
        catalog={catalog}
        currentUnavailable={currentUnavailable}
      />
    </>
  )
}

function ProviderGroupStatus({
  catalog,
  currentUnavailable,
}: {
  catalog: ProviderGroupCatalog
  currentUnavailable: boolean
}) {
  if (catalog.status === 'loading') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        Loading Provider groups
      </div>
    )
  }

  if (catalog.status === 'error') {
    return (
      <div className="flex items-center justify-between gap-3 text-sm text-destructive">
        <span>Provider groups could not be loaded.</span>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={catalog.refreshing}
          onClick={catalog.retry}
        >
          <RefreshCwIcon className={catalog.refreshing ? 'animate-spin' : ''} />
          Retry
        </Button>
      </div>
    )
  }

  if (catalog.values.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No enabled Provider group is available.
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground">
      {currentUnavailable
        ? 'A selected group is unavailable. Remove it or keep the current groups unchanged.'
        : 'Enabled Provider groups available to this account.'}
    </div>
  )
}

function providerGroupPlaceholder(catalog: ProviderGroupCatalog): string {
  if (catalog.status === 'loading') {
    return 'Loading groups'
  }
  if (catalog.status === 'error') {
    return 'Groups unavailable'
  }
  if (catalog.values.length === 0) {
    return 'No enabled groups'
  }
  return 'Select groups'
}
