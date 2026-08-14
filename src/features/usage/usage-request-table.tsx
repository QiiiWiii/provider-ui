import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatUsageDateTime,
  formatUsageEndpoint,
  formatUsageRequestStatus,
} from '@/features/usage/usage-format'
import { UsageLatency } from '@/features/usage/usage-latency'
import { CostBreakdown, TokensBreakdown } from '@/features/usage/usage-breakdowns'
import type {
  UsageRange,
  UsageRequestStatus,
  UsageRequestSummary,
} from '@/features/usage/usage-types'

export function UsageRequestsTable({
  items,
  range,
}: {
  items: UsageRequestSummary[]
  range: UsageRange
}) {
  if (items.length === 0) {
    return <UsagePanelEmpty text="No requests match the current filters." />
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">API Key</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Reasoning effort</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Latency</TableHead>
            <TableHead className="pr-4">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const meta = resolveApiKeyMeta(item)
            return (
              <TableRow key={item.requestId}>
                <TableCell className="max-w-36 truncate pl-4 font-medium">
                  {meta.name}
                </TableCell>
                <TableCell className="max-w-44 truncate font-mono text-xs">
                  {item.clientModel ?? '—'}
                </TableCell>
                <TableCell>
                  <UsageStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <code className="font-mono text-xs">
                    {formatUsageEndpoint(item.endpoint)}
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.reasoningEffort ?? '—'}
                </TableCell>
                <TableCell className="max-w-32 truncate text-muted-foreground">
                  {meta.group}
                </TableCell>
                <TableCell>
                  <TokensBreakdown tokens={item.tokens} />
                </TableCell>
                <TableCell className="tabular-nums">
                  <CostBreakdown
                    requestId={item.requestId}
                    cost={item.cost}
                    range={range}
                  />
                </TableCell>
                <TableCell>
                  <UsageLatency
                    startedAtMs={item.startedAtMs}
                    firstTokenAtMs={item.firstTokenAtMs}
                    completedAtMs={item.completedAtMs}
                  />
                </TableCell>
                <TableCell className="pr-4 whitespace-nowrap text-muted-foreground">
                  {formatUsageDateTime(item.startedAtMs)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

const statusClasses: Record<UsageRequestStatus, string> = {
  succeeded:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
  failed:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400',
  canceled:
    'border-border bg-muted text-muted-foreground',
  incomplete:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400',
}

function UsageStatusBadge({ status }: { status: UsageRequestStatus }) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {formatUsageRequestStatus(status)}
    </Badge>
  )
}

function UsagePanelEmpty({ text }: { text: string }) {
  return <Card className="p-4 text-sm text-muted-foreground">{text}</Card>
}

function resolveApiKeyMeta(item: UsageRequestSummary): {
  name: string
  group: string
} {
  if (item.apiKeyId === null) {
    return { name: 'No key', group: '—' }
  }

  return {
    name: item.apiKeyLabel ?? '—',
    group: item.apiKeyGroupLabel ?? '—',
  }
}
