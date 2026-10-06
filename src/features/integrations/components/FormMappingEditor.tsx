import { Select } from '@/components/ui'
import { LeadDefaultsEditor } from '@/features/lead-capture/components/LeadDefaultsEditor'
import { leadFieldOptions } from '@/features/lead-capture/lib/fields'
import { useCustomFields } from '@/features/settings/hooks/use-settings'
import type { LeadFormMapping } from '@/types'

const SKIP = '__skip'

/** Maps each question of one ad form to a lead field (standard or custom) and sets the defaults for its leads. */
export function FormMappingEditor({ form, onChange, disabled }: { form: LeadFormMapping; onChange: (next: LeadFormMapping) => void; disabled?: boolean }) {
  const custom = useCustomFields()
  const options = [{ value: SKIP, label: 'Do not import' }, ...leadFieldOptions(custom.data ?? [])]
  const current = (question: string) => form.fields.find((field) => field.sourceField === question)?.leadField ?? SKIP
  const set = (question: string, leadField: string) =>
    onChange({
      ...form,
      fields: [...form.fields.filter((field) => field.sourceField !== question), ...(leadField === SKIP ? [] : [{ sourceField: question, leadField }])],
    })
  const questions = form.questions.length > 0 ? form.questions : form.fields.map((field) => field.sourceField)

  return (
    <section aria-label={`Field mapping for ${form.formName}`} className="space-y-4 rounded-lg border border-border p-4">
      <h4 className="font-medium">{form.formName}</h4>
      <ul className="space-y-2">
        {questions.map((question) => (
          <li key={question} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr]">
            <span className="break-words text-sm font-mono">{question}</span>
            <Select aria-label={`Lead field for ${question}`} disabled={disabled} value={current(question)} onValueChange={(next) => set(question, next)} options={options} />
          </li>
        ))}
      </ul>
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium">Defaults for these leads</p>
        <LeadDefaultsEditor idPrefix={`map-${form.formId}`} disabled={disabled} value={form.defaults} onChange={(defaults) => onChange({ ...form, defaults })} />
      </div>
    </section>
  )
}
