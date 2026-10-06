import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormField } from '@/components/common/FormField'
import { Button, Input, ProgressBar, Select, Switch, Textarea, toast } from '@/components/ui'
import type { AnswerValue, Lead, QualificationQuestion, QualificationStatus } from '@/types'
import { useSaveQualification } from '../../../hooks/use-lead-mutations'
import { qualificationFormSchema } from '../../../lib/detail-schemas'

const STATUS_OPTIONS: { value: QualificationStatus; label: string }[] = [
  { value: 'qualified', label: 'Qualified' },
  { value: 'not_qualified', label: 'Not qualified' },
  { value: 'needs_info', label: 'Needs more information' },
]

export function QualificationTab({
  lead,
  questions,
  canEdit,
}: {
  lead: Lead
  questions: QualificationQuestion[]
  canEdit: boolean
}) {
  const save = useSaveQualification()
  const ordered = [...questions].filter((question) => question.isActive !== false).sort((a, b) => a.order - b.order)
  const [answers, setAnswers] = useState(lead.qualificationAnswers)
  const form = useForm({
    resolver: zodResolver(qualificationFormSchema),
    values: { qualificationStatus: lead.qualificationStatus, notes: '' },
  })

  useEffect(() => {
    setAnswers(lead.qualificationAnswers)
  }, [lead.id, lead.qualificationAnswers])

  const answered = ordered.filter((question) => isAnswered(answers[question.id])).length
  const setAnswer = (id: string, value: AnswerValue) => setAnswers((current) => ({ ...current, [id]: value }))

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        const qualificationAnswers = Object.fromEntries(
          Object.entries(answers).filter((entry) => isAnswered(entry[1])),
        )
        save.mutate(
          {
            id: lead.id,
            input: {
              qualificationStatus: values.qualificationStatus,
              qualificationAnswers,
              notes: values.notes,
            },
          },
          {
            onSuccess: () => {
              toast.success('Qualification saved')
              form.reset({ qualificationStatus: values.qualificationStatus, notes: '' })
            },
          },
        )
      })}
    >
      <ProgressBar
        value={ordered.length === 0 ? 0 : (answered / ordered.length) * 100}
        label={`Answered ${answered} of ${ordered.length}`}
      />
      {ordered.length === 0 ? (
        <p className="text-sm text-muted-foreground">This workspace has no qualification questions yet.</p>
      ) : null}
      {ordered.map((question) => (
        <QuestionField
          key={question.id}
          question={question}
          value={answers[question.id]}
          disabled={!canEdit}
          onChange={(value) => setAnswer(question.id, value)}
        />
      ))}
      <FormField id="qualification-status" label="Status" required error={form.formState.errors.qualificationStatus?.message}>
        {(control) => (
          <Select
            {...control}
            disabled={!canEdit}
            options={STATUS_OPTIONS}
            value={form.watch('qualificationStatus')}
            onValueChange={(value) => form.setValue('qualificationStatus', value as QualificationStatus, { shouldValidate: true })}
          />
        )}
      </FormField>
      <FormField id="qualification-notes" label="Notes" error={form.formState.errors.notes?.message}>
        {(control) => <Textarea {...control} disabled={!canEdit} {...form.register('notes')} rows={3} />}
      </FormField>
      <Button type="submit" disabled={!canEdit} loading={save.isPending}>
        Save qualification
      </Button>
    </form>
  )
}

function QuestionField({
  question,
  value,
  disabled,
  onChange,
}: {
  question: QualificationQuestion
  value: AnswerValue | undefined
  disabled: boolean
  onChange: (value: AnswerValue) => void
}) {
  const name = `q-${question.id}`
  return (
    <FormField id={name} label={question.question} required={question.required}>
      {(control) => {
        if (question.type === 'boolean') {
          return (
            <Switch
              checked={value === true}
              disabled={disabled}
              onCheckedChange={(checked) => onChange(checked)}
              aria-label={question.question}
            />
          )
        }
        if (question.type === 'number') {
          return (
            <Input
              {...control}
              type="number"
              disabled={disabled}
              value={typeof value === 'number' ? value : ''}
              onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
            />
          )
        }
        if (question.type === 'dropdown') {
          return (
            <Select
              {...control}
              disabled={disabled}
              options={question.options.map((option) => ({ value: option, label: option }))}
              value={typeof value === 'string' ? value : undefined}
              onValueChange={onChange}
              placeholder="Select"
            />
          )
        }
        return (
          <Textarea
            {...control}
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }}
    </FormField>
  )
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return !Number.isNaN(value)
  if (Array.isArray(value)) return value.length > 0
  return true
}
