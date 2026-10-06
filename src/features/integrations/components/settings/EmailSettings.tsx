import { useState } from 'react'
import { Button, Input, toast } from '@/components/ui'
import { useSendTestEmail, useUpdateIntegration } from '../../hooks/use-integrations'
import { validEmailIdentity, type EmailIdentity } from '../../lib/email-identity'
import { EmailIdentityFields } from '../EmailIdentityFields'
import type { SettingsPanelProps } from './types'

/** Sending identity, signature and tracking, plus a test email. */
export function EmailSettings({ integration }: SettingsPanelProps) {
  const config = integration.config
  const update = useUpdateIntegration('email')
  const test = useSendTestEmail()
  const [to, setTo] = useState('')
  const [draft, setDraft] = useState<EmailIdentity | null>(config?.provider === 'email' ? config : null)
  if (config?.provider !== 'email' || !draft) return null
  const dirty = JSON.stringify(draft) !== JSON.stringify({ fromName: config.fromName, fromEmail: config.fromEmail, signature: config.signature, trackOpens: config.trackOpens, trackClicks: config.trackClicks })
  const broken = integration.status !== 'connected'

  return (
    <div className="space-y-5">
      <EmailIdentityFields value={draft} onChange={setDraft} />
      <Button loading={update.isPending} disabled={!dirty || broken || !validEmailIdentity(draft)} onClick={() => update.mutate({ config: { ...config, ...draft } }, { onSuccess: () => toast.success('Email settings saved') })}>Save changes</Button>
      <div className="flex items-end gap-2 border-t border-border pt-4">
        <div className="flex-1 space-y-1">
          <label htmlFor="email-test-to" className="text-sm font-medium">Send a test email to</label>
          <Input id="email-test-to" type="email" value={to} placeholder="you@company.com" onChange={(event) => setTo(event.target.value)} />
        </div>
        <Button variant="outline" disabled={!to || broken} loading={test.isPending} onClick={() => test.mutate(to, { onSuccess: () => toast.success('Test email sent') })}>Send test</Button>
      </div>
    </div>
  )
}
