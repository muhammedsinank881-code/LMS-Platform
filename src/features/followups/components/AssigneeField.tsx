import { useMemo } from 'react'
import { FormField } from '@/components/common/FormField'
import { Select } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useAuthStore } from '@/store/auth-store'
import type { Resource } from '@/types'

export function AssigneeField({
  id,
  resource,
  value,
  onChange,
  error,
}: {
  id: string
  resource: Extract<Resource, 'followups' | 'tasks'>
  value: string
  onChange: (userId: string) => void
  error?: string
}) {
  const { can, getScope } = usePermission()
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const directory = useDirectory()
  const canAssign = can(resource, 'assign')
  const scope = getScope(resource)
  const me = directory.data?.find((user) => user.id === userId)

  const options = useMemo(() => {
    const users = directory.data ?? []
    const visible =
      scope === 'own'
        ? users.filter((user) => user.id === userId)
        : scope === 'team'
          ? users.filter((user) => user.teamId && user.teamId === me?.teamId)
          : users
    const list = canAssign ? visible : visible.filter((user) => user.id === userId)
    return list.map((user) => ({ value: user.id, label: user.name }))
  }, [canAssign, directory.data, me?.teamId, scope, userId])

  return (
    <FormField id={id} label="Assignee" error={error} required>
      {(control) => (
        <Select
          id={control.id}
          invalid={control.invalid}
          aria-describedby={control['aria-describedby']}
          options={options}
          value={value}
          disabled={!canAssign}
          onValueChange={onChange}
          placeholder="Choose a person"
        />
      )}
    </FormField>
  )
}
