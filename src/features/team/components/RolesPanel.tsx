import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, Select, toast } from '@/components/ui'
import { useResetPermissions, useUpdatePermissions } from '@/features/settings/hooks/use-settings'
import { SETTINGS_LINKS } from '@/features/settings/sections'
import { usePermissionMatrix } from '@/hooks/use-permission-matrix'
import { diffMatrix, ROLE_LABELS } from '@/lib/permissions'
import {
  ACTIONS,
  DATA_SCOPES,
  RESOURCES,
  ROLES,
  type Action,
  type DataScope,
  type PermissionMatrix,
  type Resource,
  type Role,
} from '@/types'

function titleCase(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function RolesPanel() {
  const current = usePermissionMatrix()
  const save = useUpdatePermissions()
  const reset = useResetPermissions()
  const [draft, setDraft] = useState<PermissionMatrix | null>(null)
  const [role, setRole] = useState<Role>('admin')
  const [confirm, setConfirm] = useState(false)
  const matrix = draft ?? current.data?.matrix
  const changes = useMemo(
    () => (matrix && current.data ? diffMatrix(current.data.matrix, matrix) : []),
    [current.data, matrix],
  )
  const blocked = queryBlocked(current)
  if (blocked) return blocked
  if (!matrix || !current.data) return queryBlocked({ isLoading: false, isError: true, refetch: () => current.refetch() })
  const locked = role === 'super_admin'
  const grants = current.data.sectionGrants[role]
  const toggle = (resource: Resource, action: Action) => {
    if (locked) return
    const access = matrix[role][resource]
    const actions = access.actions.includes(action)
      ? access.actions.filter((item) => item !== action)
      : [...access.actions, action]
    setDraft({ ...matrix, [role]: { ...matrix[role], [resource]: { ...access, actions } } })
  }
  const setScope = (resource: Resource, scope: DataScope) => {
    if (locked) return
    const access = matrix[role][resource]
    setDraft({ ...matrix, [role]: { ...matrix[role], [resource]: { ...access, scope } } })
  }
  return (
    <div className="mt-4 space-y-4">
      <ControlRow>
        <ControlField>
          <Select
            aria-label="Role"
            value={role}
            options={ROLES.map((item) => ({ value: item, label: ROLE_LABELS[item] }))}
            onValueChange={(value) => setRole(value as Role)}
          />
        </ControlField>
        {locked ? (
          <p className="shrink-0 text-sm text-muted-foreground">Super admin is locked.</p>
        ) : changes.length > 0 ? (
          <Badge tone="warning" dot>
            {changes.length} unsaved
          </Badge>
        ) : (
          <p className="shrink-0 text-sm text-muted-foreground">Choose what this role can do.</p>
        )}
        <Button
          className="ml-auto shrink-0"
          variant="outline"
          onClick={() => reset.mutate(undefined, { onSuccess: () => { setDraft(null); toast.success('Permissions reset') } })}
        >
          Reset to defaults
        </Button>
        <Button className="shrink-0" disabled={changes.length === 0 || locked} onClick={() => setConfirm(true)}>
          Save permissions
        </Button>
      </ControlRow>
      <div className="space-y-3 lg:hidden">
        {RESOURCES.map((resource) => (
          <section key={resource} className="space-y-3 rounded-md border border-border p-3">
            <h3 className="text-sm font-medium">{titleCase(resource)}</h3>
            <Select
              aria-label={`${ROLE_LABELS[role]} ${titleCase(resource)} scope`}
              value={matrix[role][resource].scope}
              disabled={locked}
              options={DATA_SCOPES.map((scope) => ({ value: scope, label: titleCase(scope) }))}
              onValueChange={(scope) => setScope(resource, scope as DataScope)}
            />
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map((action) => (
                <label key={action} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-primary"
                    aria-label={`${ROLE_LABELS[role]} ${titleCase(resource)} ${action}`}
                    checked={matrix[role][resource].actions.includes(action)}
                    disabled={locked}
                    onChange={() => toggle(resource, action)}
                  />
                  {titleCase(action)}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-md border border-border lg:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="sticky left-0 bg-muted px-3 py-2 font-medium">Resource</th>
              <th className="px-3 py-2 font-medium">Scope</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-3 py-2 text-center font-medium">
                  {titleCase(action)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((resource) => (
              <tr key={resource} className="border-t border-border">
                <th className="sticky left-0 bg-surface px-3 py-2 font-medium">{titleCase(resource)}</th>
                <td className="px-3 py-2">
                  <Select
                    aria-label={`${ROLE_LABELS[role]} ${titleCase(resource)} scope`}
                    size="sm"
                    className="w-28"
                    value={matrix[role][resource].scope}
                    disabled={locked}
                    options={DATA_SCOPES.map((scope) => ({ value: scope, label: titleCase(scope) }))}
                    onValueChange={(scope) => setScope(resource, scope as DataScope)}
                  />
                </td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      aria-label={`${ROLE_LABELS[role]} ${titleCase(resource)} ${action}`}
                      checked={matrix[role][resource].actions.includes(action)}
                      disabled={locked}
                      onChange={() => toggle(resource, action)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <h3 className="mb-2 text-sm font-medium">Settings sections for {ROLE_LABELS[role]}</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SETTINGS_LINKS.map((link) => (
            <Badge key={link.section} tone={grants[link.section] ? 'success' : 'neutral'} dot>
              {link.label}
            </Badge>
          ))}
        </div>
      </section>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Save permission changes?"
        description="This writes an audit entry and applies to everyone with the changed roles."
        confirmLabel="Save"
        loading={save.isPending}
        onConfirm={() =>
          save.mutate(
            { matrix, sectionGrants: current.data.sectionGrants },
            { onSuccess: () => { setDraft(null); setConfirm(false); toast.success('Permissions saved') } },
          )
        }
      />
    </div>
  )
}
