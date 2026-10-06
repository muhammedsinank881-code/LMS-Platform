import { useState } from 'react'
import { Button, Input, Select, toast } from '@/components/ui'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { formatDateTime } from '@/lib/format/date'
import { ENGAGEMENT_SIGNALS, isLeadId, type EngagementSignal } from '@/types'
import {
  useAdvanceClock,
  useSimulatedClock,
  useSimulateEngagement,
  useSimulateFormSubmission,
} from '../hooks/use-simulator'

const SIGNAL_LABEL: Record<EngagementSignal, string> = {
  whatsappReplies: 'WhatsApp reply',
  emailOpens: 'Email opened',
  demosAttended: 'Demo attended',
  quotationRequests: 'Quotation requested',
  formSubmissions: 'Form submitted',
  websiteVisits: 'Website visit',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Dev-only. Moves time forward for delays and idle triggers, and fakes engagement for scoring. */
export function SimulatorAutomation() {
  const leads = useLeads({ pageSize: 50 })
  const clock = useSimulatedClock()
  const advance = useAdvanceClock()
  const engagement = useSimulateEngagement()
  const form = useSimulateFormSubmission()
  const [leadId, setLeadId] = useState('')
  const [signal, setSignal] = useState<EngagementSignal>('whatsappReplies')
  const [formId, setFormId] = useState('pricing')
  const lead = isLeadId(leadId) ? leadId : null
  const moved = (label: string) => ({ onSuccess: () => toast.success(label) })
  const offsetHours = Math.round(((clock.data?.offsetMs ?? 0) / 3_600_000) * 10) / 10

  return (
    <>
      <Section title="Simulated clock">
        <p className="text-xs text-muted-foreground">
          {clock.data ? `Now ${formatDateTime(clock.data.now)}${offsetHours ? ` (${offsetHours}h ahead)` : ''}` : 'Loading…'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" loading={advance.isPending} onClick={() => advance.mutate(60, moved('Clock moved 1 hour'))}>
            +1 hour
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={advance.isPending} onClick={() => advance.mutate(1440, moved('Clock moved 1 day'))}>
            +1 day
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={advance.isPending || !offsetHours} onClick={() => advance.mutate(null, moved('Clock reset'))}>
            Reset
          </Button>
        </div>
      </Section>
      <Section title="Engagement">
        <Select
          aria-label="Engagement lead"
          placeholder="Choose a lead"
          value={leadId || undefined}
          onValueChange={setLeadId}
          options={(leads.data?.items ?? []).map((item) => ({ value: item.id, label: item.name }))}
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Select aria-label="Signal" value={signal} onValueChange={(value) => setSignal(value as EngagementSignal)} options={ENGAGEMENT_SIGNALS.map((s) => ({ value: s, label: SIGNAL_LABEL[s] }))} />
          <Button type="button" size="sm" disabled={!lead} loading={engagement.isPending} onClick={() => lead && engagement.mutate({ leadId: lead, signal }, moved('Signal recorded and lead re-scored'))}>
            Record
          </Button>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input aria-label="Form name" value={formId} onChange={(event) => setFormId(event.target.value)} />
          <Button type="button" size="sm" variant="outline" disabled={!lead || !formId.trim()} loading={form.isPending} onClick={() => lead && form.mutate({ leadId: lead, formId: formId.trim() }, moved('Form submitted'))}>
            Submit form
          </Button>
        </div>
      </Section>
    </>
  )
}
