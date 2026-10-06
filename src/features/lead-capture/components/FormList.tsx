import { Archive, ArchiveRestore, Copy, Pencil, Power } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/lib/format/date'
import type { FormStatus, LeadForm } from '@/types'
import { useDuplicateForm, useSetFormStatus } from '../hooks/use-lead-forms'

const TONE: Record<FormStatus, 'success' | 'neutral' | 'warning'> = { active: 'success', disabled: 'warning', archived: 'neutral' }

/** One card per form with its status, submission count and the actions that change its state. */
export function FormList({ forms, onEdit }: { forms: LeadForm[]; onEdit: (form: LeadForm) => void }) {
  const status = useSetFormStatus()
  const duplicate = useDuplicateForm()
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {forms.map((form) => (
        <li key={form.id} className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-medium">{form.name}</h3>
              <p className="text-sm text-muted-foreground">{form.fields.length} fields · {form.submissionCount} submissions · updated {formatDate(form.updatedAt)}</p>
            </div>
            <Badge tone={TONE[form.status]} dot>{form.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(form)}><Pencil aria-hidden="true" /> Edit</Button>
            <Button size="sm" variant="outline" loading={duplicate.isPending && duplicate.variables === form.id} onClick={() => duplicate.mutate(form.id)}><Copy aria-hidden="true" /> Duplicate</Button>
            {form.status !== 'archived' ? (
              <Button size="sm" variant="outline" onClick={() => status.mutate({ id: form.id, status: form.status === 'active' ? 'disabled' : 'active' })}>
                <Power aria-hidden="true" /> {form.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => status.mutate({ id: form.id, status: form.status === 'archived' ? 'disabled' : 'archived' })}>
              {form.status === 'archived' ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
              {form.status === 'archived' ? 'Restore' : 'Archive'}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
