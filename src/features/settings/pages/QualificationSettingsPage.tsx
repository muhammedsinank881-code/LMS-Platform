import { useState } from 'react'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { SortableList } from '@/components/common/LazySortableList'
import { queryBlocked } from '@/components/common/query-blocked'
import { Button, Input, Select, Switch, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { QUESTION_TYPES, type QuestionType } from '@/types'
import { Link } from 'react-router-dom'
import { SectionIntro } from '../components/SettingsLayout'
import {
  useCreateQualificationQuestion,
  useQualificationQuestions,
  useReorderQualificationQuestions,
  useUpdateQualificationQuestion,
} from '../hooks/use-settings'

export function QualificationSettingsPage() {
  const { canSection } = usePermission()
  const questions = useQualificationQuestions()
  const create = useCreateQualificationQuestion()
  const update = useUpdateQualificationQuestion()
  const reorder = useReorderQualificationQuestions()
  const [text, setText] = useState('')
  const [type, setType] = useState<QuestionType>('text')
  if (!canSection('qualification')) return <NoAccess />
  const blocked = queryBlocked(questions)
  if (blocked) return blocked
  const rows = questions.data ?? []
  return (
    <div className="space-y-4">
      <SectionIntro title="Qualification questions" description="Active questions render on a lead’s Qualification tab." />
      <ControlRow>
        <ControlField grow label="Question">
          <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Question" />
        </ControlField>
        <ControlField label="Type">
          <Select value={type} options={QUESTION_TYPES.map((item) => ({ value: item, label: item }))} onValueChange={(value) => setType(value as QuestionType)} />
        </ControlField>
        <Button className="shrink-0"
          onClick={() =>
            text.trim() &&
            create.mutate(
              { question: text.trim(), type, options: type === 'dropdown' ? ['Yes', 'No'] : [], required: false, isActive: true },
              { onSuccess: () => { setText(''); toast.success('Question added') } },
            )
          }
        >
          Add
        </Button>
      </ControlRow>
      <SortableList
        items={rows}
        onReorder={(ids) => reorder.mutateAsync(ids)}
        renderItem={(question) => (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">{question.question}</span>
            <Switch checked={question.isActive !== false} onCheckedChange={(isActive) => update.mutate({ id: question.id, patch: { isActive } })} aria-label={`Active ${question.question}`} />
          </div>
        )}
      />
      <section className="rounded-md border border-border p-4 text-sm">
        <p className="font-medium">Preview</p>
        <ul className="mt-2 space-y-1">
          {rows.filter((question) => question.isActive !== false).map((question) => (
            <li key={question.id}>{question.question}</li>
          ))}
        </ul>
        <Link className="mt-3 inline-block text-primary" to="/leads">Open a lead to see the Qualification tab</Link>
      </section>
    </div>
  )
}
