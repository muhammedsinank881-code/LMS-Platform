import { useEffect, useRef, useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { INTEGRATION_PROVIDER_LABEL, type IntegrationProvider } from '@/types'
import { PROVIDER_META } from '../lib/provider-meta'

const SCOPES: Partial<Record<IntegrationProvider, string[]>> = {
  facebook_lead_ads: ['Read your page’s lead forms', 'Receive new leads as they are submitted'],
  instagram: ['Read leads from your linked page', 'Receive new leads as they are submitted'],
  google_ads: ['View your ad accounts', 'Receive lead form extension leads', 'Read campaign cost data'],
  linkedin: ['Read Lead Gen Forms', 'Receive new leads as they are submitted'],
  email: ['Send email on your behalf', 'Read replies to threads you start'],
}

/**
 * A stand-in for a provider's consent popup. It exists so the connection flow reads like the
 * real one; nothing leaves the browser and no token is issued.
 */
export function FakeOAuth({ provider, label, onAuthorized, onCancel }: { provider: IntegrationProvider; label?: string; onAuthorized: () => void; onCancel?: () => void }) {
  const [authorizing, setAuthorizing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const Icon = PROVIDER_META[provider].icon
  const name = label ?? INTEGRATION_PROVIDER_LABEL[provider]

  return (
    <div role="group" aria-label={`${name} sign-in (simulated)`} className="mx-auto max-w-sm space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><Icon aria-hidden="true" className="h-5 w-5" /></span>
        <div>
          <p className="font-medium">Sign in with {name}</p>
          <p className="text-xs text-muted-foreground">Simulated. No real account is contacted.</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <p className="font-medium">LeadFlow would be able to:</p>
        <ul className="space-y-1">
          {(SCOPES[provider] ?? ['Access your account']).map((scope) => (
            <li key={scope} className="flex items-start gap-2"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />{scope}</li>
          ))}
        </ul>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="h-4 w-4" /> You can revoke access at any time.</p>
      <div className="flex gap-2">
        {onCancel ? <Button variant="outline" className="flex-1" disabled={authorizing} onClick={onCancel}>Cancel</Button> : null}
        <Button className="flex-1" loading={authorizing} onClick={() => { setAuthorizing(true); timer.current = setTimeout(onAuthorized, 700) }}>Allow access</Button>
      </div>
    </div>
  )
}
