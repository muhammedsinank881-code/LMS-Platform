import { Badge, Input, Label, Switch } from '@/components/ui'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ScoreCategory, ScoreDecay } from '@/types'
import { useScoreDistribution } from '../../hooks/use-scoring'
import { validateDraft, type ScoringDraft } from '../../lib/scoring-draft'

const CATEGORY: Array<{ key: ScoreCategory; label: string; tone: 'hot' | 'warm' | 'cold' }> = [
  { key: 'hot', label: 'Hot', tone: 'hot' },
  { key: 'warm', label: 'Warm', tone: 'warm' },
  { key: 'cold', label: 'Cold', tone: 'cold' },
]

const asNumber = (value: string) => (value === '' ? Number.NaN : Number(value))

/** Hot/warm/cold cut-offs with a live distribution preview, and the inactivity decay setting. */
export function ThresholdsAndDecay({
  draft,
  onChange,
  disabled,
}: {
  draft: ScoringDraft
  onChange: (draft: ScoringDraft) => void
  disabled: boolean
}) {
  const errors = validateDraft(draft)
  const debounced = useDebouncedValue(draft.thresholds, 300)
  const distribution = useScoreDistribution(debounced, !errors.thresholds)
  const total = distribution.data?.total ?? 0
  const setThreshold = (key: 'hot' | 'warm', value: string) => onChange({ ...draft, thresholds: { ...draft.thresholds, [key]: asNumber(value) } })
  const setDecay = (patch: Partial<ScoreDecay>) => onChange({ ...draft, decay: { ...draft.decay, ...patch } })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-label="Thresholds" className="space-y-3 rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Hot, warm and cold</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="threshold-hot">Hot at or above</Label>
            <Input id="threshold-hot" type="number" min={1} max={100} disabled={disabled} value={Number.isFinite(draft.thresholds.hot) ? draft.thresholds.hot : ''} invalid={Boolean(errors.thresholds)} onChange={(e) => setThreshold('hot', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="threshold-warm">Warm at or above</Label>
            <Input id="threshold-warm" type="number" min={0} max={99} disabled={disabled} value={Number.isFinite(draft.thresholds.warm) ? draft.thresholds.warm : ''} invalid={Boolean(errors.thresholds)} onChange={(e) => setThreshold('warm', e.target.value)} />
          </div>
        </div>
        {errors.thresholds ? <p role="alert" className="text-sm text-destructive">{errors.thresholds}</p> : null}
        <div aria-label="Distribution preview" aria-live="polite" className="space-y-2">
          <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={distribution.data ? `${distribution.data.hot} hot, ${distribution.data.warm} warm, ${distribution.data.cold} cold` : 'Loading distribution'}>
            {distribution.data && total > 0
              ? CATEGORY.map(({ key, tone }) => (
                  <span key={key} style={{ width: `${(distribution.data[key] / total) * 100}%` }} className={tone === 'hot' ? 'bg-score-hot' : tone === 'warm' ? 'bg-score-warm' : 'bg-score-cold'} />
                ))
              : null}
          </div>
          <ul className="flex flex-wrap gap-2">
            {CATEGORY.map(({ key, label, tone }) => (
              <li key={key}>
                <Badge tone={tone} dot>
                  {label}: {distribution.data ? distribution.data[key] : '…'}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Counts use each lead&apos;s saved score. Recalculate to apply rule changes.</p>
        </div>
      </section>
      <section aria-label="Score decay" className="space-y-3 rounded-md border border-border p-4">
        <div className="flex items-center gap-2">
          <Switch id="decay-on" checked={draft.decay.enabled} disabled={disabled} onCheckedChange={(enabled) => setDecay({ enabled })} />
          <Label htmlFor="decay-on">Lower the score after inactivity</Label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="decay-days">After (days without activity)</Label>
            <Input id="decay-days" type="number" min={1} max={365} disabled={disabled || !draft.decay.enabled} invalid={Boolean(errors.afterDays)} value={Number.isFinite(draft.decay.afterDays) ? draft.decay.afterDays : ''} onChange={(e) => setDecay({ afterDays: asNumber(e.target.value) })} />
            {errors.afterDays ? <p role="alert" className="text-sm text-destructive">{errors.afterDays}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="decay-points">Points removed</Label>
            <Input id="decay-points" type="number" min={1} max={100} disabled={disabled || !draft.decay.enabled} invalid={Boolean(errors.points)} value={Number.isFinite(draft.decay.points) ? draft.decay.points : ''} onChange={(e) => setDecay({ points: asNumber(e.target.value) })} />
            {errors.points ? <p role="alert" className="text-sm text-destructive">{errors.points}</p> : null}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {draft.decay.enabled
            ? `A lead with no activity for ${draft.decay.afterDays} days loses ${draft.decay.points} points.`
            : 'Off. Scores only change when rules or lead details change.'}
        </p>
      </section>
    </div>
  )
}
