import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { useCustomFields } from '@/features/settings/hooks/use-settings'
import { useSources } from '@/features/settings/hooks/use-lead-config'
import type { LeadForm } from '@/types'
import { useSaveLeadForm } from '../hooks/use-lead-forms'
import { defaultFormInput, toInput } from '../lib/form-draft'
import { validateDraft } from '../lib/validate-draft'
import { FieldEditor } from './FieldEditor'
import { FieldList } from './FieldList'
import { FormPreview } from './FormPreview'
import { FormSettingsPanel } from './FormSettingsPanel'
import { PublishPanel } from './PublishPanel'
import { SubmissionsPanel } from './SubmissionsPanel'

/**
 * Builds or edits one form. Editor on the left, live preview on the right from `xl`; on tablets
 * and phones the preview stacks below so nothing is cut off.
 */
export function FormBuilder({ form, onBack }: { form: LeadForm | null; onBack: () => void }) {
  const customFields = useCustomFields()
  const sources = useSources()
  const save = useSaveLeadForm()
  const landing = sources.data?.find((source) => source.key === 'landing_page')?.id ?? null
  const [saved, setSaved] = useState<LeadForm | null>(form)
  const [draft, setDraft] = useState(() => (form ? toInput(form) : defaultFormInput(landing, customFields.data ?? [])))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const errors = useMemo(() => validateDraft(draft), [draft])
  const visible = showErrors ? errors : {}
  const editing = draft.fields.find((field) => field.id === editingId) ?? null
  const dirty = !saved || JSON.stringify(toInput(saved)) !== JSON.stringify(draft)

  function submit() {
    setShowErrors(true)
    if (Object.keys(errors).length > 0) {
      toast.error('Fix the highlighted fields first')
      return
    }
    save.mutate({ id: saved?.id ?? null, values: draft }, { onSuccess: (result) => { setSaved(result); toast.success(saved ? 'Form saved' : 'Form created') } })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft aria-hidden="true" /> All forms</Button>
        <Button loading={save.isPending} disabled={!dirty} onClick={submit}>{saved ? 'Save changes' : 'Create form'}</Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <Tabs defaultValue="fields" className="min-w-0">
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="fields">
            <FieldList
              fields={draft.fields}
              customFields={customFields.data ?? []}
              error={visible.fields}
              onChange={(fields) => setDraft({ ...draft, fields })}
              onEdit={setEditingId}
            />
          </TabsContent>
          <TabsContent value="settings">
            <FormSettingsPanel draft={draft} errors={visible} onChange={setDraft} />
          </TabsContent>
          <TabsContent value="publish">
            <PublishPanel form={saved} />
          </TabsContent>
          <TabsContent value="submissions">
            <SubmissionsPanel formId={saved?.id ?? null} />
          </TabsContent>
        </Tabs>
        <FormPreview draft={draft} />
      </div>
      <FieldEditor
        field={editing}
        error={editing ? visible[`field:${draft.fields.findIndex((field) => field.id === editing.id)}`] : undefined}
        onChange={(next) => setDraft({ ...draft, fields: draft.fields.map((field) => (field.id === next.id ? next : field)) })}
        onClose={() => setEditingId(null)}
      />
    </div>
  )
}
