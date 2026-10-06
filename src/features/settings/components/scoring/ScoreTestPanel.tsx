import { useState } from 'react'
import { Button, Select } from '@/components/ui'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { ScoreBreakdownView } from '@/features/leads/components/detail/rail/ScoreBreakdownView'
import { useScoringSettings, useTestLeadScore } from '../../hooks/use-scoring'

/** Pick a lead and see exactly how the current rules score it, in the same shape as the lead's Score card. */
export function ScoreTestPanel() {
  const leads = useLeads({ pageSize: 50 })
  const settings = useScoringSettings()
  const test = useTestLeadScore()
  const [leadId, setLeadId] = useState('')

  return (
    <section aria-label="Test a lead" className="space-y-3 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Test a lead</h3>
      <div className="flex flex-wrap gap-2">
        <div className="min-w-56 flex-1">
          <Select
            aria-label="Lead to score"
            placeholder="Choose a lead"
            value={leadId || undefined}
            options={(leads.data?.items ?? []).map((lead) => ({ value: lead.id, label: `${lead.name} (${lead.id})` }))}
            onValueChange={(value) => {
              setLeadId(value)
              test.mutate(value)
            }}
          />
        </div>
        <Button type="button" variant="outline" disabled={!leadId} loading={test.isPending} onClick={() => test.mutate(leadId)}>
          Score again
        </Button>
      </div>
      <div aria-live="polite">
        {test.data ? <ScoreBreakdownView result={test.data} thresholds={settings.data?.thresholds} /> : <p className="text-sm text-muted-foreground">Nothing is saved. This shows what the rules give right now.</p>}
      </div>
    </section>
  )
}
