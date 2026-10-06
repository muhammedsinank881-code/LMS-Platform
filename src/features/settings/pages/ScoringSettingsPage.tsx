import { useCallback, useMemo, useState } from 'react'
import { NoAccess } from '@/components/common/NoAccess'
import { queryBlocked } from '@/components/common/query-blocked'
import { toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { SectionIntro } from '../components/SettingsLayout'
import { useRegisterSave } from '../components/use-save-bar'
import { RecalculateCard } from '../components/scoring/RecalculateCard'
import { RuleList } from '../components/scoring/RuleList'
import { ScoreTestPanel } from '../components/scoring/ScoreTestPanel'
import { ThresholdsAndDecay } from '../components/scoring/ThresholdsAndDecay'
import { useScoringSettings, useUpdateScoringSettings } from '../hooks/use-scoring'
import { validateDraft, type ScoringDraft } from '../lib/scoring-draft'

export function ScoringSettingsPage() {
  const { canSection, can } = usePermission()
  const settings = useScoringSettings()
  if (!canSection('scoring')) return <NoAccess />
  const blocked = queryBlocked(settings)
  if (blocked) return blocked
  // Remount on server change so the draft restarts from the saved values.
  const saved = settings.data!
  return <Loaded key={JSON.stringify(saved)} saved={saved} canEdit={can('settings', 'edit')} />
}

function Loaded({ saved, canEdit }: { saved: ScoringDraft; canEdit: boolean }) {
  const update = useUpdateScoringSettings()
  const [draft, setDraft] = useState<ScoringDraft>(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const invalid = Object.keys(validateDraft(draft)).length > 0

  const { mutate, isPending } = update
  const discard = useCallback(() => setDraft(saved), [saved])
  const save = useCallback(() => {
    if (invalid) {
      toast.error('Fix the highlighted fields first')
      return
    }
    mutate(draft, { onSuccess: () => toast.success('Scoring settings saved') })
  }, [draft, invalid, mutate])
  const state = useMemo(
    () => (dirty && canEdit ? { dirty: true, saving: isPending, save, discard } : null),
    [dirty, canEdit, isPending, save, discard],
  )
  useRegisterSave(state)

  return (
    <div className="space-y-6">
      <SectionIntro title="Scoring rules" description="Rules turn lead details and engagement into a 0 to 100 score. Thresholds decide hot, warm and cold." />
      <RuleList canEdit={canEdit} />
      <ThresholdsAndDecay draft={draft} onChange={setDraft} disabled={!canEdit} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreTestPanel />
        <RecalculateCard canEdit={canEdit} />
      </div>
    </div>
  )
}
