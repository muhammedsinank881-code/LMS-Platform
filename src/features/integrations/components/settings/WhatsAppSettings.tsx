import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyField } from '@/components/common/CopyField'
import { SecretField } from '@/components/common/SecretField'
import { Badge, Button, Input, toast } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import { useSyncTemplates, useUpdateIntegration, useVerifyWebhook } from '../../hooks/use-integrations'
import type { SettingsPanelProps } from './types'

/** Phone number details, webhook check, template sync and token replacement. */
export function WhatsAppSettings({ integration }: SettingsPanelProps) {
  const config = integration.config
  const update = useUpdateIntegration('whatsapp')
  const verify = useVerifyWebhook()
  const sync = useSyncTemplates()
  const [token, setToken] = useState('')
  if (config?.provider !== 'whatsapp') return null
  const broken = integration.status !== 'connected'

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Display name</dt><dd className="font-medium">{config.displayName}</dd></div>
        <div><dt className="text-muted-foreground">Quality rating</dt><dd><Badge tone={config.quality === 'green' ? 'success' : config.quality === 'yellow' ? 'warning' : 'destructive'} dot>{config.quality === 'green' ? 'High' : config.quality === 'yellow' ? 'Medium' : 'Low'}</Badge></dd></div>
        <div><dt className="text-muted-foreground">Business account</dt><dd className="font-mono text-xs">{config.businessAccountId}</dd></div>
        <div><dt className="text-muted-foreground">Phone number ID</dt><dd className="font-mono text-xs">{config.phoneNumberId}</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Access token</dt><dd><SecretField masked={config.token.masked} label="Access token" /></dd></div>
      </dl>
      <CopyField label="Callback URL" value={config.callbackUrl} />
      <CopyField label="Verify token" value={config.verifyToken} />
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={config.webhookVerified ? 'success' : 'warning'} dot>{config.webhookVerified ? 'Webhook verified' : 'Webhook not verified'}</Badge>
        <Button size="sm" variant="outline" disabled={broken} loading={verify.isPending} onClick={() => verify.mutate(undefined, { onSuccess: () => toast.success('Webhook verified') })}>Verify webhook</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{config.templatesSyncedAt ? `Templates synced ${formatDateTime(config.templatesSyncedAt)}.` : 'Templates not synced yet.'}</p>
        <Button size="sm" variant="outline" disabled={broken} loading={sync.isPending} onClick={() => sync.mutate(undefined, { onSuccess: ({ count }) => toast.success(`Synced ${count} templates`) })}>Sync templates</Button>
        <Link className="text-sm text-primary underline-offset-4 hover:underline" to="/settings/templates">Open templates</Link>
      </div>
      <div className="flex items-end gap-2 border-t border-border pt-4">
        <div className="flex-1 space-y-1">
          <label htmlFor="wa-new-token" className="text-sm font-medium">Replace access token</label>
          <Input id="wa-new-token" type="password" autoComplete="off" placeholder="Paste a new token" value={token} onChange={(event) => setToken(event.target.value)} />
        </div>
        <Button disabled={!token.trim() || broken} loading={update.isPending} onClick={() => update.mutate({ config, secret: token }, { onSuccess: () => { setToken(''); toast.success('Token replaced') } })}>Replace</Button>
      </div>
    </div>
  )
}
