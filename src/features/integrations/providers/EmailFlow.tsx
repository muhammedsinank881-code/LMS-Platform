import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { Button, Input, toast } from '@/components/ui'
import { EMAIL_PROVIDERS, type EmailProvider } from '@/types'
import { EmailIdentityFields } from '../components/EmailIdentityFields'
import { validEmailIdentity, type EmailIdentity } from '../lib/email-identity'
import { FakeOAuth } from '../components/FakeOAuth'
import { FlowShell } from '../components/FlowShell'
import { useConnectIntegration, useSendTestEmail } from '../hooks/use-integrations'
import type { ConnectFlowProps } from './types'

const STEPS = [
  { id: 'provider', label: 'Provider' },
  { id: 'account', label: 'Account' },
  { id: 'identity', label: 'Identity' },
  { id: 'test', label: 'Test' },
]

const LABEL: Record<EmailProvider, { name: string; hint: string }> = {
  google: { name: 'Google Workspace or Gmail', hint: 'Sign in with Google.' },
  microsoft: { name: 'Microsoft 365 or Outlook', hint: 'Sign in with Microsoft.' },
  smtp: { name: 'SMTP / IMAP', hint: 'Use your own mail server credentials.' },
}

/** Pick a mail provider, authorise or enter credentials, set the sending identity, then send a test email. */
export function EmailFlow({ onDone, onCancel }: ConnectFlowProps) {
  const connect = useConnectIntegration()
  const test = useSendTestEmail()
  const [step, setStep] = useState(0)
  const [mailProvider, setMailProvider] = useState<EmailProvider>('google')
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [identity, setIdentity] = useState<EmailIdentity>({ fromName: '', fromEmail: '', signature: '', trackOpens: true, trackClicks: false })
  const [connected, setConnected] = useState(false)
  const [to, setTo] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const smtp = mailProvider === 'smtp'
  const accountOk = smtp ? Boolean(password.trim()) : authorized

  function finish() {
    connect.mutate(
      { provider: 'email', accountLabel: identity.fromEmail, secret: smtp ? password : undefined, config: { provider: 'email', mailProvider, ...identity, password: null, testSentAt: null } },
      { onSuccess: () => { setPassword(''); setConnected(true) } },
    )
  }

  if (connected) {
    return (
      <FlowShell steps={STEPS} current={3} hideNext onNext={onDone} onBack={() => undefined} onCancel={onDone}>
        <div className="space-y-4">
          <div role="status" className="space-y-1 text-center"><CircleCheck aria-hidden="true" className="mx-auto h-10 w-10 text-success" /><p className="font-medium">Email is connected</p></div>
          <FormField id="test-to" label="Send a test email to" hint="Checks that sending works with this identity.">
            {(control) => <Input {...control} type="email" value={to} placeholder="you@company.com" onChange={(event) => setTo(event.target.value)} />}
          </FormField>
          {sentTo ? <p role="status" className="text-sm text-success">Test email sent to {sentTo}.</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" loading={test.isPending} disabled={!to} onClick={() => test.mutate(to, { onSuccess: (result) => { setSentTo(result.sentTo); toast.success('Test email sent') } })}>Send test email</Button>
            <Button onClick={onDone}>Done</Button>
          </div>
        </div>
      </FlowShell>
    )
  }

  return (
    <FlowShell
      steps={STEPS}
      current={step}
      hideNext={step === 1 && !smtp}
      canNext={step === 1 ? accountOk : step === 2 ? validEmailIdentity(identity) : true}
      nextLabel={step === 2 ? 'Connect email' : 'Next'}
      loading={connect.isPending}
      onCancel={onCancel}
      onBack={() => { setAuthorized(false); setStep((current) => current - 1) }}
      onNext={() => (step === 2 ? finish() : setStep((current) => current + 1))}
    >
      {step === 0 ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Where does your email live?</legend>
          {EMAIL_PROVIDERS.map((provider) => (
            <label key={provider} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="mail-provider" className="mt-0.5 h-4 w-4 accent-[var(--primary)]" checked={mailProvider === provider} onChange={() => setMailProvider(provider)} />
              <span><span className="block font-medium">{LABEL[provider].name}</span><span className="text-muted-foreground">{LABEL[provider].hint}</span></span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {step === 1 && !smtp ? <FakeOAuth provider="email" label={mailProvider === 'google' ? 'Google' : 'Microsoft'} onAuthorized={() => { setAuthorized(true); setStep(2) }} onCancel={() => setStep(0)} /> : null}
      {step === 1 && smtp ? (
        <>
          <p className="text-sm text-muted-foreground">The password is stored masked and never shown again.</p>
          <FormField id="smtp-password" label="Mailbox password" required>{(control) => <Input {...control} type="password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} />}</FormField>
        </>
      ) : null}
      {step === 2 ? <EmailIdentityFields value={identity} onChange={setIdentity} /> : null}
    </FlowShell>
  )
}
