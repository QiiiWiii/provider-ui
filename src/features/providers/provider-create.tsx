import { useIsMutating } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  BotIcon,
  BracesIcon,
  CloudCogIcon,
  Code2Icon,
  KeyRoundIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogChangeEventDetails,
} from '@/components/ui/dialog'
import { CompatibleProviderForm } from '@/features/providers/compatible-provider-form'
import { ProviderCreateBody } from '@/features/providers/provider-create-shared'
import { ProviderJsonImportForm } from '@/features/providers/provider-json-import-form'
import { ProviderOAuthStartForm } from '@/features/providers/provider-oauth-start-form'
import {
  formatOAuthService,
  formatProviderKind,
  isCompatibleProvider,
  isOAuthProvider,
  parseProviderKind,
} from '@/features/providers/provider-format'
import { ProviderOAuthFlow } from '@/features/providers/provider-oauth-flow'
import { providerKeys } from '@/features/providers/providers-query'
import type { ProviderKind } from '@/features/providers/provider-types'

const providerOptions = [
  {
    value: 'grok',
    title: 'Grok',
    description: 'xAI account via OAuth or JSON.',
    icon: SparklesIcon,
  },
  {
    value: 'codex',
    title: 'Codex',
    description: 'Codex subscription via OAuth or JSON.',
    icon: Code2Icon,
  },
  {
    value: 'openai_compatible',
    title: 'OpenAI-compatible',
    description: 'OpenAI Chat Completions or Responses endpoint.',
    icon: BotIcon,
  },
  {
    value: 'anthropic_compatible',
    title: 'Anthropic-compatible',
    description: 'Anthropic Messages endpoint.',
    icon: CloudCogIcon,
  },
] as const satisfies ReadonlyArray<{
  value: ProviderKind
  title: string
  description: string
  icon: typeof SparklesIcon
}>

type OAuthMethod = 'oauth' | 'json'

type CreateStep = {
  provider: ProviderKind | null
  method: OAuthMethod | null
  oauthSessionId: string | null
}

// The wizard keeps its position in the list route's search params, so a reload
// in the middle of a device authorization returns to the same step instead of
// stranding a session the server is still holding. `create` is what marks the
// dialog open, because the first step has no parameter of its own.
const openParam = 'create'

// Wider and roomier than the popup default, which leaves two columns of cards
// pressed against the edge. The close button is nudged to stay level with the
// title, and the body and footer restate this 24px inset in their own negative
// margins.
const createDialogClasses =
  'flex max-h-[calc(100svh-2rem)] flex-col gap-5 p-6 sm:max-w-xl [&>[data-slot=dialog-close]]:top-4 [&>[data-slot=dialog-close]]:right-4'

export function ProviderCreateDialog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const creating = useIsMutating({ mutationKey: providerKeys.create }) > 0
  const open = searchParams.has(openParam)
  const current = readStep(searchParams)
  // Closing empties the parameters while the popup is still mounted for its
  // exit animation, so the rendered step is held in state and refreshed only
  // while open. Reading the URL directly would flip the content back to the
  // type picker on the way out.
  const [step, setStep] = useState(current)

  if (open && !isSameStep(step, current)) {
    setStep(current)
  }

  // A submitted request outlives the popup, so dismissing one reads as a
  // cancellation that never happened. Escape is off on the authorization step
  // too: the session id lives only in this URL, and dropping it leaves the
  // server holding a session nothing can reach. The close button stays there,
  // because it is deliberate and Cancel is what ends the session upstream.
  //
  // Opening pushes, so Back closes the dialog; closing replaces, so the
  // abandoned step is not what Back returns to.
  function handleOpenChange(
    nextOpen: boolean,
    details: DialogChangeEventDetails,
  ) {
    const escaped = details.reason === 'escape-key'

    if (creating || (step.oauthSessionId !== null && escaped)) {
      return
    }

    setSearchParams(nextOpen ? { [openParam]: '1' } : {}, {
      replace: !nextOpen,
    })
  }

  // A backdrop press lands too easily next to a half-filled form, so it no
  // longer counts as a dismissal.
  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add provider
      </DialogTrigger>
      <DialogContent className={createDialogClasses}>
        <CreateStepContent step={step} />
      </DialogContent>
    </Dialog>
  )
}

// Each step owns the whole popup: header, scrolling body and, where the step
// has an action, the footer. Keeping them siblings is what lets the body
// scroll under a header and a footer that stay put.
function CreateStepContent({ step }: { step: CreateStep }) {
  const [, setSearchParams] = useSearchParams()
  const { provider, method, oauthSessionId } = step

  if (oauthSessionId) {
    const oauthProvider =
      provider && isOAuthProvider(provider) ? provider : undefined

    return (
      <>
        <StepHeader
          title={`${oauthProvider ? formatProviderKind(oauthProvider) : 'Provider'} authorization`}
          description={`Complete the ${oauthProvider ? formatOAuthService(oauthProvider) : 'upstream'} device authorization flow.`}
        />
        <ProviderOAuthFlow
          sessionId={oauthSessionId}
          provider={oauthProvider}
          onRestart={(restartProvider) =>
            setSearchParams(
              stepSearch({ provider: restartProvider, method: 'oauth' }),
              { replace: true },
            )
          }
        />
      </>
    )
  }

  if (!provider) {
    return (
      <>
        <StepHeader title="Add provider" description="Choose a provider type." />
        <ProviderCreateBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {providerOptions.map((option) => (
              <SelectionCard
                key={option.value}
                to={stepSearch({ provider: option.value })}
                title={option.title}
                description={option.description}
                icon={option.icon}
              />
            ))}
          </div>
        </ProviderCreateBody>
      </>
    )
  }

  if (isOAuthProvider(provider) && !method) {
    return (
      <>
        <StepHeader
          title={`Connect ${formatProviderKind(provider)}`}
          description="Choose a connection method."
          back={{ to: stepSearch({}), label: 'Change provider type' }}
        />
        <ProviderCreateBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectionCard
              to={stepSearch({ provider, method: 'oauth' })}
              title="Connect with OAuth"
              description={`${formatOAuthService(provider)} device authorization.`}
              icon={KeyRoundIcon}
              recommended
            />
            <SelectionCard
              to={stepSearch({ provider, method: 'json' })}
              title="Import credential JSON"
              description="Use an existing credential document."
              icon={BracesIcon}
            />
          </div>
        </ProviderCreateBody>
      </>
    )
  }

  if (isOAuthProvider(provider) && method === 'oauth') {
    return (
      <>
        <StepHeader
          title={`Connect ${formatProviderKind(provider)} with OAuth`}
          description="Configure the account before authorization."
          back={{
            to: stepSearch({ provider }),
            label: 'Change connection method',
          }}
        />
        <ProviderOAuthStartForm
          provider={provider}
          onSessionStarted={(sessionId) =>
            setSearchParams(stepSearch({ provider, oauthSessionId: sessionId }), {
              replace: true,
            })
          }
        />
      </>
    )
  }

  if (isOAuthProvider(provider) && method === 'json') {
    return (
      <>
        <StepHeader
          title={`Import ${formatProviderKind(provider)} credential JSON`}
          description="Review and import the credential JSON."
          back={{
            to: stepSearch({ provider }),
            label: 'Change connection method',
          }}
        />
        <ProviderJsonImportForm provider={provider} />
      </>
    )
  }

  if (!isCompatibleProvider(provider)) {
    return null
  }

  return (
    <>
      <StepHeader
        title={`Connect ${formatProviderKind(provider)}`}
        description="Configure the endpoint and API key."
        back={{ to: stepSearch({}), label: 'Change provider type' }}
      />
      <CompatibleProviderForm provider={provider} />
    </>
  )
}

function StepHeader({
  title,
  description,
  back,
}: {
  title: string
  description: string
  back?: { to: string; label: string }
}) {
  return (
    <DialogHeader>
      {back ? (
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="-mt-2 -ml-2 w-fit text-muted-foreground"
          render={<Link to={back.to} />}
        >
          <ArrowLeftIcon />
          {back.label}
        </Button>
      ) : null}
      <DialogTitle className="pr-8">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  )
}

// Focus draws an offset outline rather than the border swap the inputs use: on
// a tile this size, recolouring the border and stacking a ring flush against it
// reads as the border being swallowed. The list rows already focus this way.
function SelectionCard({
  to,
  title,
  description,
  icon: Icon,
  recommended = false,
}: {
  to: string
  title: string
  description: string
  icon: typeof SparklesIcon
  recommended?: boolean
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-xl border bg-muted/50 p-5 transition-colors hover:border-foreground/15 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon className="size-5" />
        </span>
        {recommended ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-medium text-primary-foreground">
            Recommended
          </span>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <h3 className="font-medium">{title}</h3>
        <p className="leading-5 text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}

function readStep(searchParams: URLSearchParams): CreateStep {
  return {
    provider: parseProviderKind(searchParams.get('provider')),
    method: parseOAuthMethod(searchParams.get('method')),
    oauthSessionId: searchParams.get('oauth_session'),
  }
}

// Later parameters only mean anything under an earlier one, so a step that
// drops the provider drops the rest of the wizard state with it.
function stepSearch(step: {
  provider?: ProviderKind
  method?: OAuthMethod
  oauthSessionId?: string
}): string {
  const next = new URLSearchParams({ [openParam]: '1' })

  if (step.provider) {
    next.set('provider', step.provider)

    if (step.method) {
      next.set('method', step.method)
    }

    if (step.oauthSessionId) {
      next.set('oauth_session', step.oauthSessionId)
    }
  }

  return `?${next.toString()}`
}

function isSameStep(left: CreateStep, right: CreateStep): boolean {
  return (
    left.provider === right.provider &&
    left.method === right.method &&
    left.oauthSessionId === right.oauthSessionId
  )
}

function parseOAuthMethod(value: string | null): OAuthMethod | null {
  return value === 'oauth' || value === 'json' ? value : null
}
