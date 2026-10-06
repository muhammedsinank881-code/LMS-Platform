import { FilterChips } from '@/components/common/FilterChips'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/ui'
import type { FilterFieldConfig } from '@/components/common/filter-builder/operators'
import { FOLLOWUP_TYPES, PRIORITIES, type FollowUpFilterField, type FilterCondition } from '@/types'
import { FOLLOW_UP_TYPE_META } from '../type-meta'

const ALL = 'all'

function valueOf(filters: FilterCondition<FollowUpFilterField>[], field: FollowUpFilterField): string {
  const found = filters.find((filter) => filter.field === field && filter.operator === 'equals')
  return found && 'value' in found ? String(found.value) : ALL
}

export function FollowUpFilters({
  search,
  filters,
  users,
  sources,
  onSearch,
  onFilters,
}: {
  search: string
  filters: FilterCondition<FollowUpFilterField>[]
  users: Array<{ id: string; name: string }>
  sources: Array<{ id: string; name: string }>
  onSearch: (value: string) => void
  onFilters: (filters: FilterCondition<FollowUpFilterField>[]) => void
}) {
  const setField = (field: FollowUpFilterField, value: string) => {
    const rest = filters.filter((filter) => filter.field !== field)
    if (value === ALL) onFilters(rest)
    else onFilters([...rest, { field, operator: 'equals', value }])
  }

  const fields: FilterFieldConfig<FollowUpFilterField>[] = [
    { id: 'assigneeId', label: 'Assignee', type: 'user', options: users.map((user) => ({ value: user.id, label: user.name })) },
    { id: 'type', label: 'Type', type: 'select', options: FOLLOWUP_TYPES.map((type) => ({ value: type, label: FOLLOW_UP_TYPE_META[type].label })) },
    { id: 'priority', label: 'Priority', type: 'select', options: PRIORITIES.map((priority) => ({ value: priority, label: priority })) },
    { id: 'sourceId', label: 'Source', type: 'select', options: sources.map((source) => ({ value: source.id, label: source.name })) },
  ]

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <SearchInput defaultValue={search} onValueChange={onSearch} placeholder="Search follow-ups" aria-label="Search follow-ups" />
        <Select aria-label="Assignee" value={valueOf(filters, 'assigneeId')} onValueChange={(value) => setField('assigneeId', value)} options={[{ value: ALL, label: 'All assignees' }, ...users.map((user) => ({ value: user.id, label: user.name }))]} />
        <Select aria-label="Type" value={valueOf(filters, 'type')} onValueChange={(value) => setField('type', value)} options={[{ value: ALL, label: 'All types' }, ...FOLLOWUP_TYPES.map((type) => ({ value: type, label: FOLLOW_UP_TYPE_META[type].label }))]} />
        <Select aria-label="Priority" value={valueOf(filters, 'priority')} onValueChange={(value) => setField('priority', value)} options={[{ value: ALL, label: 'All priorities' }, ...PRIORITIES.map((priority) => ({ value: priority, label: priority }))]} />
        <Select aria-label="Lead source" value={valueOf(filters, 'sourceId')} onValueChange={(value) => setField('sourceId', value)} options={[{ value: ALL, label: 'All sources' }, ...sources.map((source) => ({ value: source.id, label: source.name }))]} />
      </div>
      <FilterChips
        fields={fields}
        filters={filters}
        onRemove={(index) => onFilters(filters.filter((_, item) => item !== index))}
        onClear={() => onFilters([])}
      />
    </div>
  )
}
