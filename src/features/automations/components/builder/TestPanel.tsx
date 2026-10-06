import { useState } from 'react'
import { Check, CircleAlert, Clock, FlaskConical, Minus, X } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, Skeleton } from '@/components/ui'
import { useDeals } from '@/features/deals/hooks/use-deals'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { formatDateTime } from '@/lib/format/date'
import { ACTION_REGISTRY } from '@/lib/automation'
import type { AutomationActionType, AutomationContent, AutomationRunStep, DryRunResult, EntityRef } from '@/types'
import { useTestAutomation } from '../../hooks/use-automations'

const STATUS_ICON = { succeeded: Check, failed: X, skipped: Minus, waiting: Clock, pending: Minus } as const
const STATUS_TEXT = { succeeded: 'Would run', failed: 'Would fail', skipped: 'Skipped', waiting: 'Waiting', pending: 'Pending' } as const

export function StepRow({ step }: { step: AutomationRunStep }) {
  const Icon = STATUS_ICON[step.status]
  const label = ACTION_REGISTRY[step.actionType as AutomationActionType]?.label ?? step.actionType
  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="font-medium">
          {label} <span className="font-normal text-muted-foreground">· {STATUS_TEXT[step.status]}</span>
        </span>
        <span className="block break-words text-muted-foreground">{step.error ?? step.result}</span>
      </span>
    </li>
  )
}

function Result({ result }: { result: DryRunResult }) {
  return (
    <div className="space-y-3" aria-live="polite">
      <section aria-label="Conditions">
        <h4 className="text-sm font-medium">Conditions: {result.matched ? 'matched' : 'did not match'}</h4>
        {result.conditionTrace.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conditions, so this always runs.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {result.conditionTrace.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-sm">
                {item.matched ? <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>
                  <span className="font-medium">{item.matched ? 'Matched' : 'Failed'}:</span> {item.label}
                  <span className="block text-muted-foreground">{item.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {result.matched ? (
        <section aria-label="Steps">
          <h4 className="text-sm font-medium">What would happen</h4>
          <ol className="mt-1 space-y-1.5">
            {result.steps.map((step) => (
              <StepRow key={step.path} step={step} />
            ))}
          </ol>
          {result.waitsUntil ? (
            <p className="mt-2 text-sm text-muted-foreground">First wait ends {formatDateTime(result.waitsUntil)}. Later steps are shown as if that time has passed.</p>
          ) : null}
        </section>
      ) : null}
      {result.warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {warning}
        </p>
      ))}
    </div>
  )
}

/** Dry run against a sample lead or deal. Nothing is written or sent. */
export function TestPanel({ content, disabled }: { content: AutomationContent; disabled?: boolean }) {
  const [kind, setKind] = useState<'lead' | 'deal'>('lead')
  const [picked, setPicked] = useState('')
  const leads = useLeads({ pageSize: 25 })
  const deals = useDeals({ pageSize: 25 })
  const test = useTestAutomation()
  const options =
    kind === 'lead'
      ? (leads.data?.items ?? []).map((l) => ({ value: l.id, label: `${l.name} (${l.id})` }))
      : (deals.data?.items ?? []).map((d) => ({ value: d.id, label: `${d.title} (${d.id})` }))
  const entity: EntityRef | null = picked ? { kind, id: picked } : null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical aria-hidden="true" className="h-4 w-4" />
          Test with a sample
        </CardTitle>
        <CardDescription>Dry run: shows what would happen. Nothing is saved or sent.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-[7rem_1fr] gap-2">
          <Select
            aria-label="Sample type"
            value={kind}
            options={[
              { value: 'lead', label: 'Lead' },
              { value: 'deal', label: 'Deal' },
            ]}
            onValueChange={(next) => {
              setKind(next as 'lead' | 'deal')
              setPicked('')
              test.reset()
            }}
          />
          <Select aria-label="Sample record" value={picked || undefined} placeholder={`Choose a ${kind}`} options={options} onValueChange={setPicked} />
        </div>
        <Button type="button" variant="outline" disabled={!entity || disabled} loading={test.isPending} onClick={() => entity && test.mutate({ content, entity })}>
          Run dry run
        </Button>
        {test.isPending ? <Skeleton className="h-16 w-full" /> : null}
        {test.data ? <Result result={test.data} /> : null}
      </CardContent>
    </Card>
  )
}
