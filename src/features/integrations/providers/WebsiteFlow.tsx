import { useState } from 'react'
import { CopyField } from '@/components/common/CopyField'
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui'
import { useWorkspace } from '@/hooks/use-workspace'
import { FlowShell } from '../components/FlowShell'
import { useConnectIntegration } from '../hooks/use-integrations'
import type { ConnectFlowProps } from './types'

const STEPS = [
  { id: 'site', label: 'Site' },
  { id: 'install', label: 'Install' },
]

const DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/i

/** Website tracking: enter the domain, paste the snippet, confirm the install (simulated). */
export function WebsiteFlow({ onDone, onCancel }: ConnectFlowProps) {
  const { tenantId } = useWorkspace()
  const connect = useConnectIntegration()
  const [step, setStep] = useState(0)
  const [domain, setDomain] = useState('')
  const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const snippet = `<script async src="https://cdn.leadflow.example/track.js" data-workspace="${tenantId ?? 'workspace'}"></script>`

  return (
    <FlowShell
      steps={STEPS}
      current={step}
      canNext={step === 0 ? DOMAIN.test(clean) : true}
      nextLabel={step === 1 ? 'I have added it, connect' : 'Next'}
      loading={connect.isPending}
      onCancel={onCancel}
      onBack={() => setStep(0)}
      onNext={() => (step === 0 ? setStep(1) : connect.mutate({ provider: 'website', accountLabel: clean, config: { provider: 'website', domain: clean, snippetInstalled: true } }, { onSuccess: onDone }))}
    >
      {step === 0 ? (
        <FormField id="site-domain" label="Website domain" required hint="For example example.com" error={domain && !DOMAIN.test(clean) ? 'Enter a domain like example.com' : undefined}>
          {(control) => <Input {...control} value={domain} onChange={(event) => setDomain(event.target.value)} />}
        </FormField>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Add this snippet just before the closing <code>&lt;/head&gt;</code> tag on every page of {clean}.</p>
          <CopyField label="Tracking snippet" value={snippet} multiline />
        </>
      )}
    </FlowShell>
  )
}
