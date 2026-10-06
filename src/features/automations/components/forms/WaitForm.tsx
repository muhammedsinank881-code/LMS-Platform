import { NumberInput, PickOne } from './controls'
import { UNIT_OPTIONS } from './options'

type Unit = 'minutes' | 'hours' | 'days'

export function WaitForm({
  amount,
  unit,
  onChange,
  error,
}: {
  amount: number
  unit: Unit
  onChange: (next: { amount: number; unit: Unit }) => void
  error?: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberInput label="Wait for" min={1} value={amount} error={error} onChange={(next) => onChange({ amount: next, unit })} />
      <PickOne label="Unit" value={unit} options={UNIT_OPTIONS} onChange={(next) => onChange({ amount, unit: next as Unit })} />
    </div>
  )
}
