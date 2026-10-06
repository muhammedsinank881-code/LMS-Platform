import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Button, Switch, toast } from '@/components/ui'
import { INTEGRATION_PROVIDER_LABEL, type LeadAdsProvider, type LeadFormMapping } from '@/types'
import { FakeOAuth } from '../components/FakeOAuth'
import { FlowShell } from '../components/FlowShell'
import { FormMappingEditor } from '../components/FormMappingEditor'
import { useConnectIntegration, useSendTestLead } from '../hooks/use-integrations'
import { FAKE_ACCOUNTS } from '../lib/fake-provider-data'
import { emptyDefaults, suggestMapping } from '../lib/suggest'
import type { ConnectFlowProps } from './types'

const STEPS = [
  { id: 'connect', label: 'Connect' },
  { id: 'account', label: 'Account' },
  { id: 'forms', label: 'Forms' },
  { id: 'mapping', label: 'Mapping' },
  { id: 'finish', label: 'Finish' },
]

const CONTACT = ['phone', 'whatsapp', 'email']

function Check({ id, label, hint, checked, onChange, type }: { id: string; label: string; hint?: string; checked: boolean; onChange: (on: boolean) => void; type: 'radio' | 'checkbox' }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input id={id} type={type} name="choice" className="mt-0.5 h-4 w-4 accent-[var(--primary)]" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span><span className="block font-medium">{label}</span>{hint ? <span className="text-muted-foreground">{hint}</span> : null}</span>
    </label>
  )
}

/** Facebook, Instagram, Google Ads and LinkedIn: sign in, pick the account and forms, map the fields. */
export function LeadAdsFlow({ provider, onDone, onCancel }: ConnectFlowProps) {
  const ads = provider as LeadAdsProvider
  const accounts = FAKE_ACCOUNTS[ads]
  const multi = ads === 'google_ads'
  const connect = useConnectIntegration()
  const testLead = useSendTestLead()
  const [step, setStep] = useState(0)
  const [chosen, setChosen] = useState<string[]>([])
  const [formIds, setFormIds] = useState<string[]>([])
  const [forms, setForms] = useState<LeadFormMapping[]>([])
  const [syncSpend, setSyncSpend] = useState(true)
  const [syncCampaigns, setSyncCampaigns] = useState(true)
  const [connected, setConnected] = useState(false)
  const label = INTEGRATION_PROVIDER_LABEL[ads]
  const selected = accounts.filter((account) => chosen.includes(account.id))
  const available = selected.flatMap((account) => account.forms)
  const unmapped = forms.filter((form) => !form.fields.some((field) => CONTACT.includes(field.leadField)))

  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((item) => item !== id))

  function toMapping() {
    setForms(available.filter((form) => formIds.includes(form.formId)).map((form) => forms.find((item) => item.formId === form.formId) ?? { ...form, fields: suggestMapping(form.questions), defaults: emptyDefaults() }))
    setStep(3)
  }

  function finish() {
    const page = selected[0]
    connect.mutate(
      {
        provider: ads,
        accountLabel: selected.map((account) => account.name).join(', '),
        config: { provider: ads, pageId: multi ? null : page.id, pageName: multi ? null : page.name, accountIds: multi ? chosen : [], forms, syncCampaigns: multi && syncCampaigns, syncSpend: multi && syncSpend, lastLeadAt: null },
      },
      { onSuccess: () => setConnected(true) },
    )
  }

  if (connected) {
    return (
      <FlowShell steps={STEPS} current={4} hideNext onNext={onDone} onBack={() => undefined} onCancel={onDone}>
        <div role="status" className="space-y-3 text-center">
          <CircleCheck aria-hidden="true" className="mx-auto h-10 w-10 text-success" />
          <p className="font-medium">{label} is connected</p>
          <p className="text-sm text-muted-foreground">New submissions will arrive as leads. Send a test lead to see exactly what one looks like.</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" loading={testLead.isPending} onClick={() => testLead.mutate({ provider: ads }, { onSuccess: (result) => toast.success(`Test lead ${result.leadId} created`) })}>Send test lead</Button>
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
      hideNext={step === 0}
      canNext={step === 1 ? chosen.length > 0 : step === 2 ? formIds.length > 0 : step === 3 ? unmapped.length === 0 : true}
      nextLabel={step === 4 ? `Connect ${label}` : 'Next'}
      loading={connect.isPending}
      onCancel={onCancel}
      onBack={() => setStep((current) => current - 1)}
      onNext={() => (step === 2 ? toMapping() : step === 4 ? finish() : setStep((current) => current + 1))}
    >
      {step === 0 ? <FakeOAuth provider={ads} onAuthorized={() => setStep(1)} onCancel={onCancel} /> : null}
      {step === 1 ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">{multi ? 'Choose the ad accounts to use' : ads === 'linkedin' ? 'Choose the company page' : 'Choose the page that runs your lead ads'}</legend>
          {accounts.map((account) => (
            <Check key={account.id} id={`acc-${account.id}`} type={multi ? 'checkbox' : 'radio'} label={account.name} hint={`${account.forms.length} lead forms`} checked={chosen.includes(account.id)} onChange={(on) => setChosen(multi ? toggle(chosen, account.id, on) : [account.id])} />
          ))}
        </fieldset>
      ) : null}
      {step === 2 ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Which forms should send leads here?</legend>
          {available.map((form) => (
            <Check key={form.formId} id={`form-${form.formId}`} type="checkbox" label={form.formName} hint={`${form.questions.length} questions`} checked={formIds.includes(form.formId)} onChange={(on) => setFormIds(toggle(formIds, form.formId, on))} />
          ))}
        </fieldset>
      ) : null}
      {step === 3 ? (
        <>
          <p className="text-sm text-muted-foreground">We guessed the mapping from the question names. Check it, and map any custom fields. Each form needs a phone, WhatsApp or email field.</p>
          {forms.map((form) => <FormMappingEditor key={form.formId} form={form} onChange={(next) => setForms(forms.map((item) => (item.formId === next.formId ? next : item)))} />)}
          {unmapped.length > 0 ? <p role="alert" className="text-sm text-destructive">Map a contact field for {unmapped.map((form) => form.formName).join(', ')}.</p> : null}
        </>
      ) : null}
      {step === 4 ? (
        <div className="space-y-4">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Account</dt><dd className="text-right">{selected.map((account) => account.name).join(', ')}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Forms</dt><dd className="text-right">{forms.map((form) => form.formName).join(', ')}</dd></div>
          </dl>
          {multi ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3"><label htmlFor="sync-campaigns" className="text-sm">Sync campaigns</label><Switch id="sync-campaigns" checked={syncCampaigns} onCheckedChange={setSyncCampaigns} /></div>
              <div className="flex items-center justify-between gap-3"><label htmlFor="sync-spend" className="text-sm">Sync daily spend <span className="text-muted-foreground">(feeds CPL and ROAS)</span></label><Switch id="sync-spend" checked={syncSpend} onCheckedChange={setSyncSpend} /></div>
            </div>
          ) : null}
        </div>
      ) : null}
    </FlowShell>
  )
}
