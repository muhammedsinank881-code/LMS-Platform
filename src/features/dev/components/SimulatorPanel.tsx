import { useState } from 'react'
import { X } from 'lucide-react'
import { Button, Input, Select, Textarea, toast } from '@/components/ui'
import { useTemplates } from '@/features/inbox/hooks/use-templates'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { isLeadId } from '@/types'
import {
  useSimulateEmail,
  useSimulateMissedCall,
  useSimulateTemplateOutcome,
  useSimulateWhatsApp,
} from '../hooks/use-simulator'
import { SimulatorAutomation } from './SimulatorAutomation'
import { SimulatorCapture } from './SimulatorCapture'
import { SimulatorDelivery } from './SimulatorDelivery'

const UNKNOWN = 'unknown'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** Dev-only. Triggers the events a real WhatsApp, email or phone provider would send. */
export function SimulatorPanel({ onClose }: { onClose: () => void }) {
  const leads = useLeads({ pageSize: 50 })
  const templates = useTemplates()
  const wa = useSimulateWhatsApp()
  const email = useSimulateEmail()
  const missed = useSimulateMissedCall()
  const resolve = useSimulateTemplateOutcome()
  const [contact, setContact] = useState(UNKNOWN)
  const [phone, setPhone] = useState('+919999988888')
  const [address, setAddress] = useState('new.customer@example.com')
  const [body, setBody] = useState('Hi, can you share pricing?')
  const [subject, setSubject] = useState('Question about your service')
  const [templateId, setTemplateId] = useState('')
  const [reason, setReason] = useState('Remove the variable from the start of the message.')
  const leadId = isLeadId(contact) ? contact : undefined
  const unknown = leadId === undefined
  const pending = (templates.data ?? []).filter((item) => item.status === 'pending')
  const chosen = pending.find((item) => item.id === templateId) ?? pending[0]
  const done = (message: string) => ({ onSuccess: () => toast.success(message) })

  return (
    <div
      role="dialog"
      aria-label="Dev simulator"
      className="fixed bottom-20 right-4 z-40 max-h-[80dvh] w-[calc(100vw-2rem)] max-w-sm space-y-3 overflow-y-auto rounded-lg border border-border bg-surface p-4 shadow-modal lg:bottom-6 lg:right-20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Dev simulator</p>
          <p className="text-xs text-muted-foreground">Fakes what WhatsApp, email and phones would send.</p>
        </div>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Close simulator" onClick={onClose}>
          <X />
        </Button>
      </div>

      <Section title="Incoming">
        <Select
          aria-label="Contact"
          value={contact}
          onValueChange={setContact}
          options={[
            { value: UNKNOWN, label: 'Unknown number or email' },
            ...(leads.data?.items ?? []).map((lead) => ({ value: lead.id, label: lead.name })),
          ]}
        />
        {unknown ? (
          <div className="grid grid-cols-2 gap-2">
            <Input aria-label="Unknown phone" placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <Input aria-label="Unknown email" placeholder="Email" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
        ) : null}
        <Input aria-label="Email subject" placeholder="Email subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <Textarea aria-label="Message body" rows={2} value={body} onChange={(event) => setBody(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" loading={wa.isPending} onClick={() => wa.mutate({ leadId, phone: unknown ? phone : undefined, body }, done('WhatsApp message received'))}>
            WhatsApp
          </Button>
          <Button type="button" size="sm" variant="outline" loading={email.isPending} onClick={() => email.mutate({ leadId, email: unknown ? address : undefined, subject, body }, done('Email received'))}>
            Email
          </Button>
          <Button type="button" size="sm" variant="outline" loading={missed.isPending} onClick={() => missed.mutate({ leadId, phone: unknown ? phone : undefined }, done('Missed call logged'))}>
            Missed call
          </Button>
        </div>
      </Section>

      <SimulatorDelivery />

      <SimulatorAutomation />

      <SimulatorCapture />

      <Section title="Template review">
        {pending.length === 0 ? (
          <p className="text-xs text-muted-foreground">No template is waiting for review. Submit a WhatsApp template in Settings first.</p>
        ) : (
          <>
            <Select aria-label="Pending template" value={chosen?.id ?? ''} onValueChange={setTemplateId} options={pending.map((item) => ({ value: item.id, label: item.name }))} />
            <Input aria-label="Rejection reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={!chosen} onClick={() => chosen && resolve.mutate({ id: chosen.id, outcome: 'approved' }, done('Template approved'))}>
                Approve
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={!chosen || !reason.trim()} onClick={() => chosen && resolve.mutate({ id: chosen.id, outcome: 'rejected', reason }, done('Template rejected'))}>
                Reject
              </Button>
            </div>
          </>
        )}
      </Section>
    </div>
  )
}
