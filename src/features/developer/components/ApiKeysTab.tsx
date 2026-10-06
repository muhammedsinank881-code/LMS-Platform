import { useState } from 'react'
import { KeyRound, Plus, RefreshCw, Terminal, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import { SecretField } from '@/components/common/SecretField'
import { SecretRevealDialog } from '@/components/common/SecretRevealDialog'
import { Badge, Button } from '@/components/ui'
import { formatDate, formatDateTime } from '@/lib/format/date'
import type { ApiKey } from '@/types'
import { useApiKeys, useApiKeySummary, useRevokeApiKey } from '../hooks/use-api-keys'
import { CreateKeyDialog } from './CreateKeyDialog'
import { CurlDialog } from './CurlDialog'
import { RotateKeyDialog } from './RotateKeyDialog'

function Summary() {
  const summary = useApiKeySummary().data
  const items = [
    ['Active keys', summary?.active],
    ['Expiring in 14 days', summary?.expiringSoon],
    ['Revoked', summary?.revoked],
    ['Requests (30 days)', summary?.requests30d?.toLocaleString('en-IN')],
  ] as const
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface p-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-xl font-semibold">{value ?? '–'}</dd>
        </div>
      ))}
    </dl>
  )
}

function KeyCard({ apiKey, onRotate, onRevoke, onCurl }: { apiKey: ApiKey; onRotate: () => void; onRevoke: () => void; onCurl: () => void }) {
  const active = apiKey.status === 'active'
  return (
    <li className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-medium">{apiKey.name}</h3>
          <SecretField masked={`${apiKey.prefix}••••${apiKey.last4}`} label="API key" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={active ? 'success' : 'neutral'} dot>{active ? 'Active' : 'Revoked'}</Badge>
          {active && apiKey.graceEndsAt ? <Badge tone="warning">Replaced · works until {formatDateTime(apiKey.graceEndsAt)}</Badge> : null}
        </div>
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label="Scopes">
        {apiKey.scopes.map((scope) => <li key={scope}><Badge size="sm">{scope}</Badge></li>)}
      </ul>
      <p className="text-sm text-muted-foreground">
        {apiKey.lastUsedAt ? `Last used ${formatDateTime(apiKey.lastUsedAt)}` : 'Never used'} · {apiKey.usageCount.toLocaleString('en-IN')} requests
        {apiKey.expiresAt ? ` · expires ${formatDate(apiKey.expiresAt)}` : ''}
        {apiKey.ipAllowlist.length > 0 ? ` · ${apiKey.ipAllowlist.length} allowed IPs` : ''}
      </p>
      {active ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onCurl}><Terminal aria-hidden="true" /> Test with cURL</Button>
          <Button size="sm" variant="outline" onClick={onRotate}><RefreshCw aria-hidden="true" /> Rotate</Button>
          <Button size="sm" variant="ghost" onClick={onRevoke}><Trash2 aria-hidden="true" /> Revoke</Button>
        </div>
      ) : null}
    </li>
  )
}

export function ApiKeysTab() {
  const keys = useApiKeys()
  const revoke = useRevokeApiKey()
  const [creating, setCreating] = useState(false)
  const [secret, setSecret] = useState<string | null>(null)
  const [rotating, setRotating] = useState<ApiKey | null>(null)
  const [revoking, setRevoking] = useState<ApiKey | null>(null)
  const [curl, setCurl] = useState<ApiKey | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">Keys let your own systems call the LeadFlow API. Each key has scopes, and the full key is shown only once.</p>
        <Button onClick={() => setCreating(true)}><Plus aria-hidden="true" /> Create key</Button>
      </div>
      <Summary />
      <QueryState isLoading={keys.isLoading} isError={keys.isError} onRetry={() => void keys.refetch()} isEmpty={keys.data?.length === 0} emptyIcon={KeyRound} emptyTitle="No API keys" emptyDescription="Create a key to connect Zapier, a data warehouse or your own app." emptyAction={<Button onClick={() => setCreating(true)}>Create a key</Button>}>
        <ul className="grid gap-3 lg:grid-cols-2">
          {(keys.data ?? []).map((apiKey) => (
            <KeyCard key={apiKey.id} apiKey={apiKey} onCurl={() => setCurl(apiKey)} onRotate={() => setRotating(apiKey)} onRevoke={() => setRevoking(apiKey)} />
          ))}
        </ul>
      </QueryState>
      <CreateKeyDialog open={creating} onOpenChange={setCreating} onCreated={setSecret} />
      <RotateKeyDialog apiKey={rotating} onClose={() => setRotating(null)} onRotated={setSecret} />
      <CurlDialog apiKey={curl} onClose={() => setCurl(null)} />
      <SecretRevealDialog secret={secret} label="API key" title="Your new API key" description="Use it as a Bearer token in the Authorization header." onClose={() => setSecret(null)} />
      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setRevoking(null)}
        title={`Revoke “${revoking?.name}”?`}
        description="Anything using this key stops working immediately. This cannot be undone."
        confirmLabel="Revoke key"
        destructive
        loading={revoke.isPending}
        onConfirm={() => revoking && revoke.mutate(revoking.id, { onSuccess: () => setRevoking(null) })}
      />
    </div>
  )
}
