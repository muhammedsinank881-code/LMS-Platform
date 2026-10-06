import { useMemo, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CopyField } from '@/components/common/CopyField'
import { FormField } from '@/components/common/FormField'
import { Badge, Button, Input, toast } from '@/components/ui'
import { useWorkspace } from '@/hooks/use-workspace'
import type { IntegrationConfig } from '@/types'
import { FlowShell } from '../components/FlowShell'
import { useConnectIntegration, useSyncTemplates, useVerifyWebhook } from '../hooks/use-integrations'
import type { ConnectFlowProps } from './types'

const STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'webhook', label: 'Webhook' },
  { id: 'verify', label: 'Verify' },
]

const randomHex = (bytes: number) => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('')

type WhatsAppConfig = Extract<IntegrationConfig, { provider: 'whatsapp' }>

/** WhatsApp Business Cloud API: credentials, then the webhook values to paste into Meta, then a verification check. */
export function WhatsAppFlow({ onDone, onCancel }: ConnectFlowProps) {
  const { tenantId } = useWorkspace()
  const connect = useConnectIntegration()
  const verify = useVerifyWebhook()
  const sync = useSyncTemplates()
  const [step, setStep] = useState(0)
  const [businessAccountId, setBusinessAccountId] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [token, setToken] = useState('')
  const [result, setResult] = useState<WhatsAppConfig | null>(null)
  const [templates, setTemplates] = useState<number | null>(null)
  const verifyToken = useMemo(() => `vf_${randomHex(12)}`, [])
  const callbackUrl = `https://api.leadflow.example/webhooks/whatsapp/${tenantId ?? 'workspace'}`
  const valid = businessAccountId.trim() && phoneNumberId.trim() && displayName.trim() && token.trim()

  function finish() {
    connect.mutate(
      {
        provider: 'whatsapp',
        accountLabel: displayName.trim(),
        secret: token,
        config: { provider: 'whatsapp', businessAccountId: businessAccountId.trim(), phoneNumberId: phoneNumberId.trim(), displayName: displayName.trim(), quality: 'green', token: { masked: '' }, verifyToken, callbackUrl, webhookVerified: false, templatesSyncedAt: null },
      },
      {
        onSuccess: () => {
          setToken('')
          verify.mutate(undefined, { onSuccess: (row) => setResult(row.config?.provider === 'whatsapp' ? row.config : null) })
        },
      },
    )
  }

  if (result) {
    return (
      <FlowShell steps={STEPS} current={2} hideNext onNext={onDone} onBack={() => undefined} onCancel={onDone}>
        <div role="status" className="space-y-4">
          <div className="space-y-1 text-center">
            <CircleCheck aria-hidden="true" className="mx-auto h-10 w-10 text-success" />
            <p className="font-medium">WhatsApp is connected and the webhook is verified</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-border p-3 text-sm">
            <div><dt className="text-muted-foreground">Display name</dt><dd className="font-medium">{result.displayName}</dd></div>
            <div><dt className="text-muted-foreground">Quality rating</dt><dd><Badge tone="success" dot>{result.quality === 'green' ? 'High' : result.quality}</Badge></dd></div>
          </dl>
          <div className="space-y-2">
            <Button variant="outline" loading={sync.isPending} onClick={() => sync.mutate(undefined, { onSuccess: ({ count }) => { setTemplates(count); toast.success(`Synced ${count} templates`) } })}>Sync message templates</Button>
            {templates !== null ? <p className="text-sm text-muted-foreground">{templates} templates synced. <Link className="text-primary underline-offset-4 hover:underline" to="/settings/templates" onClick={onDone}>Review them</Link></p> : null}
          </div>
          <div className="flex justify-end"><Button onClick={onDone}>Done</Button></div>
        </div>
      </FlowShell>
    )
  }

  return (
    <FlowShell
      steps={STEPS}
      current={step}
      canNext={step === 0 ? Boolean(valid) : true}
      nextLabel={step === 2 ? 'Connect and verify webhook' : 'Next'}
      loading={connect.isPending || verify.isPending}
      onCancel={onCancel}
      onBack={() => setStep((current) => current - 1)}
      onNext={() => (step === 2 ? finish() : setStep((current) => current + 1))}
    >
      {step === 0 ? (
        <>
          <p className="text-sm text-muted-foreground">Find these in Meta Business Suite under WhatsApp Manager. The token is stored masked and never shown again.</p>
          <FormField id="wa-waba" label="Business account ID" required>{(control) => <Input {...control} inputMode="numeric" value={businessAccountId} onChange={(event) => setBusinessAccountId(event.target.value)} />}</FormField>
          <FormField id="wa-phone" label="Phone number ID" required>{(control) => <Input {...control} inputMode="numeric" value={phoneNumberId} onChange={(event) => setPhoneNumberId(event.target.value)} />}</FormField>
          <FormField id="wa-name" label="Display name" required hint="The business name customers see.">{(control) => <Input {...control} value={displayName} onChange={(event) => setDisplayName(event.target.value)} />}</FormField>
          <FormField id="wa-token" label="Access token" required>{(control) => <Input {...control} type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} />}</FormField>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <p className="text-sm text-muted-foreground">In the Meta app, open WhatsApp, then Configuration, and paste these two values into the webhook settings. Subscribe to the <strong>messages</strong> field.</p>
          <CopyField label="Callback URL" value={callbackUrl} />
          <CopyField label="Verify token" value={verifyToken} />
        </>
      ) : null}
      {step === 2 ? <p className="text-sm">Ready. We will save the connection, then run a verification check on the webhook. This is simulated, so it passes once the values are saved.</p> : null}
    </FlowShell>
  )
}

