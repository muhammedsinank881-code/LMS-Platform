import { useState } from 'react'
import { Button, Switch, toast } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import type { IntegrationConfig, LeadAdsConfig, LeadAdsProvider } from '@/types'
import { useSendTestLead, useSyncSpend, useUpdateIntegration } from '../../hooks/use-integrations'
import { FormMappingEditor } from '../FormMappingEditor'
import type { SettingsPanelProps } from './types'

type AdsConfig = LeadAdsConfig & { provider: LeadAdsProvider }

/** Field mapping and defaults per form, sync toggles, and the "send a test lead" and "sync spend" actions. */
export function LeadAdsSettings({ integration }: SettingsPanelProps) {
  const saved = integration.config as AdsConfig
  const update = useUpdateIntegration(integration.provider)
  const testLead = useSendTestLead()
  const spend = useSyncSpend()
  const [draft, setDraft] = useState<AdsConfig>(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const google = integration.provider === 'google_ads'
  const broken = integration.status !== 'connected'

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{saved.lastLeadAt ? `Last lead received ${formatDateTime(saved.lastLeadAt)}.` : 'No lead received yet.'} {integration.leadsReceived} leads received in total.</p>
      {draft.forms.map((form) => (
        <FormMappingEditor key={form.formId} form={form} disabled={broken} onChange={(next) => setDraft({ ...draft, forms: draft.forms.map((item) => (item.formId === next.formId ? next : item)) })} />
      ))}
      {google ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3"><label htmlFor="ga-campaigns" className="text-sm">Sync campaigns</label><Switch id="ga-campaigns" checked={draft.syncCampaigns} onCheckedChange={(syncCampaigns) => setDraft({ ...draft, syncCampaigns })} /></div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="ga-spend" className="text-sm">Sync daily spend</label><Switch id="ga-spend" checked={draft.syncSpend} onCheckedChange={(syncSpend) => setDraft({ ...draft, syncSpend })} /></div>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button loading={update.isPending} disabled={!dirty || broken} onClick={() => update.mutate({ config: draft as IntegrationConfig }, { onSuccess: () => toast.success('Mapping saved') })}>Save changes</Button>
        <Button variant="outline" disabled={broken || dirty} loading={testLead.isPending} onClick={() => testLead.mutate({ provider: integration.provider }, { onSuccess: (result) => toast.success(`Test lead ${result.leadId} created`) })}>Send test lead</Button>
        {google ? <Button variant="outline" disabled={broken || !saved.syncSpend || dirty} loading={spend.isPending} onClick={() => spend.mutate(undefined, { onSuccess: ({ created }) => toast.success(created > 0 ? `Created ${created} spend entries` : 'Spend is already up to date') })}>Sync spend now</Button> : null}
      </div>
    </div>
  )
}
