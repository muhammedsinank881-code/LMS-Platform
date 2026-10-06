import { useState } from 'react'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { SortableList } from '@/components/common/LazySortableList'
import { queryBlocked } from '@/components/common/query-blocked'
import { Button, EmptyState, Input, Select, Switch, toast } from '@/components/ui'
import { Inbox } from 'lucide-react'
import { useDirectory } from '@/features/team/hooks/use-team'
import { usePermission } from '@/hooks/use-permission'
import { ASSIGNMENT_DISTRIBUTIONS } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import {
  useAssignmentRules,
  useCreateAssignmentRule,
  useEvaluateAssignment,
  useReorderAssignmentRules,
  useUpdateAssignmentRule,
} from '../hooks/use-settings'

export function AssignmentSettingsPage() {
  const { canSection } = usePermission()
  const rules = useAssignmentRules()
  const create = useCreateAssignmentRule()
  const update = useUpdateAssignmentRule()
  const reorder = useReorderAssignmentRules()
  const evaluate = useEvaluateAssignment()
  const users = useDirectory()
  const [name, setName] = useState('')
  const [sourceId, setSourceId] = useState('')
  if (!canSection('assignment')) return <NoAccess />
  const blocked = queryBlocked(rules)
  if (blocked) return blocked
  const rows = rules.data ?? []
  return (
    <div className="space-y-4">
      <SectionIntro title="Assignment rules" description="Rules run in order. If none match, the workspace fallback assignee is used." />
      <ControlRow>
        <ControlField grow label="New rule">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Rule name" />
        </ControlField>
        <Button className="shrink-0"
          onClick={() =>
            name.trim() &&
            create.mutate(
              {
                name: name.trim(),
                priority: rows.length + 1,
                isActive: true,
                conditions: [],
                pool: { teamId: null, userIds: [], matchLanguage: false, matchLocation: false },
                distribution: 'round_robin',
              },
              { onSuccess: () => { setName(''); toast.success('Rule added') } },
            )
          }
        >
          Add rule
        </Button>
      </ControlRow>
      {rows.length === 0 ? <EmptyState icon={Inbox} title="No assignment rules yet" description="Add a rule to decide who receives a new lead." /> : null}
      <SortableList
        items={[...rows].sort((a, b) => a.priority - b.priority)}
        onReorder={(ids) => reorder.mutateAsync(ids)}
        renderItem={(rule) => (
          <ControlRow>
            <span className="min-w-32 shrink-0 text-sm font-medium">{rule.name}</span>
            <Switch checked={rule.isActive} onCheckedChange={(isActive) => update.mutate({ id: rule.id, patch: { isActive } })} aria-label={`Enable ${rule.name}`} />
            <ControlField label="Strategy">
              <Select
                value={rule.distribution}
                options={ASSIGNMENT_DISTRIBUTIONS.map((value) => ({ value, label: value.replaceAll('_', ' ') }))}
                onValueChange={(distribution) => update.mutate({ id: rule.id, patch: { distribution: distribution as typeof rule.distribution } })}
              />
            </ControlField>
            <span className="shrink-0 text-xs text-muted-foreground">{rule.conditions.length} conditions</span>
          </ControlRow>
        )}
      />
      <section className="rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Test this rule</h3>
        <ControlRow className="mt-3">
          <ControlField grow>
            <Input aria-label="Sample source id" value={sourceId} onChange={(event) => setSourceId(event.target.value)} placeholder="Source id" />
          </ControlField>
          <Button className="shrink-0" onClick={() => evaluate.mutate({ sourceId: sourceId || undefined, score: 80 })}>Test</Button>
        </ControlRow>
        {evaluate.data ? (
          <p className="mt-3 text-sm">
            {evaluate.data.reason}. Assignee:{' '}
            {users.data?.find((user) => user.id === evaluate.data?.userId)?.name ?? 'Unassigned'}
          </p>
        ) : null}
      </section>
    </div>
  )
}
