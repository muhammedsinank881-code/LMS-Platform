import { useState } from 'react'
import { Button, Input, Select, toast } from '@/components/ui'
import { useLeadForms } from '@/features/lead-capture/hooks/use-lead-forms'
import { INTEGRATION_PROVIDER_LABEL, INTEGRATION_PROVIDERS, LEAD_ADS_PROVIDERS, WEBHOOK_OUTCOMES, type IntegrationProvider, type LeadAdsProvider, type WebhookOutcome } from '@/types'
import { useFailIntegration, useSetWebhookOutcome, useSimulateAdLead, useSimulateFormSubmission, useSimulateSpendSync, useSimulateWhatsAppLead } from '../hooks/use-simulator-capture'

const OUTCOME_LABEL: Record<WebhookOutcome, string> = { success: 'Success (200)', http_500: 'Server error (500)', timeout: 'Timeout' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Dev-only. Fakes ad-platform leads, form submissions with UTM, unknown WhatsApp senders, webhook outcomes and integration failures. */
export function SimulatorCapture() {
  const forms = useLeadForms()
  const adLead = useSimulateAdLead()
  const submit = useSimulateFormSubmission()
  const whatsapp = useSimulateWhatsAppLead()
  const outcome = useSetWebhookOutcome()
  const fail = useFailIntegration()
  const spend = useSimulateSpendSync()
  const [ad, setAd] = useState<LeadAdsProvider>('facebook_lead_ads')
  const [formId, setFormId] = useState('')
  const [utmSource, setUtmSource] = useState('google')
  const [utmCampaign, setUtmCampaign] = useState('diwali-dhamaka-search')
  const [phone, setPhone] = useState('+919123400001')
  const [text, setText] = useState('Hi, do you install modular kitchens?')
  const [provider, setProvider] = useState<IntegrationProvider>('whatsapp')
  const active = (forms.data ?? []).filter((form) => form.status === 'active')
  const chosen = active.find((form) => form.id === formId) ?? active[0]

  return (
    <>
      <Section title="Ad platform lead">
        <div className="flex gap-2">
          <Select aria-label="Ad platform" value={ad} onValueChange={(value) => setAd(value as LeadAdsProvider)} options={LEAD_ADS_PROVIDERS.map((item) => ({ value: item, label: INTEGRATION_PROVIDER_LABEL[item] }))} />
          <Button type="button" size="sm" loading={adLead.isPending} onClick={() => adLead.mutate(ad, { onSuccess: (result) => toast.success(`Lead ${result.leadId} received`) })}>Send</Button>
        </div>
      </Section>
      <Section title="Form submission with UTM">
        {active.length === 0 ? <p className="text-xs text-muted-foreground">Publish a lead form first.</p> : (
          <>
            <Select aria-label="Form" value={chosen?.id ?? ''} onValueChange={setFormId} options={active.map((form) => ({ value: form.id, label: form.name }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input aria-label="utm_source" placeholder="utm_source" value={utmSource} onChange={(event) => setUtmSource(event.target.value)} />
              <Input aria-label="utm_campaign" placeholder="utm_campaign" value={utmCampaign} onChange={(event) => setUtmCampaign(event.target.value)} />
            </div>
            <Button type="button" size="sm" loading={submit.isPending} disabled={!chosen} onClick={() => chosen && submit.mutate({ formId: chosen.id, utm: { source: utmSource || undefined, campaign: utmCampaign || undefined } }, { onSuccess: () => toast.success('Form submitted') })}>Submit form</Button>
          </>
        )}
      </Section>
      <Section title="WhatsApp from an unknown number">
        <Input aria-label="Sender phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Input aria-label="Message" value={text} onChange={(event) => setText(event.target.value)} />
        <Button type="button" size="sm" loading={whatsapp.isPending} disabled={!phone || !text} onClick={() => whatsapp.mutate({ phone, text }, { onSuccess: (result) => toast.success(`Lead ${result.leadId} created`) })}>Send as a new lead</Button>
      </Section>
      <Section title="Webhook delivery outcome">
        <Select aria-label="Next delivery outcome" placeholder="Choose an outcome" onValueChange={(value) => outcome.mutate(value as WebhookOutcome, { onSuccess: () => toast.success('Applies to the next deliveries') })} options={WEBHOOK_OUTCOMES.map((item) => ({ value: item, label: OUTCOME_LABEL[item] }))} />
      </Section>
      <Section title="Integration problems">
        <Select aria-label="Integration" value={provider} onValueChange={(value) => setProvider(value as IntegrationProvider)} options={INTEGRATION_PROVIDERS.map((item) => ({ value: item, label: INTEGRATION_PROVIDER_LABEL[item] }))} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" loading={fail.isPending} onClick={() => fail.mutate({ provider, kind: 'error' }, { onSuccess: () => toast.success('Integration set to error') })}>Force error</Button>
          <Button type="button" size="sm" variant="outline" loading={fail.isPending} onClick={() => fail.mutate({ provider, kind: 'expired' }, { onSuccess: () => toast.success('Token expired') })}>Expire token</Button>
          <Button type="button" size="sm" variant="outline" loading={spend.isPending} onClick={() => spend.mutate(undefined, { onSuccess: ({ created }) => toast.success(`Spend sync created ${created} entries`) })}>Sync spend</Button>
        </div>
      </Section>
    </>
  )
}
