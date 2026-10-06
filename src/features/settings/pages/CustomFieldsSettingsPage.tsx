import { useMemo, useState } from 'react'
import { DynamicFields } from '@/components/common/DynamicFields'
import { NoAccess } from '@/components/common/NoAccess'
import { SortableList } from '@/components/common/LazySortableList'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, Input, Select, Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { activeFields, fieldKeyFromLabel } from '@/lib/settings/custom-field'
import { CUSTOM_FIELD_ENTITIES, CUSTOM_FIELD_TYPES, type CustomFieldDefinition, type CustomFieldEntity } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import { useCreateCustomField, useCustomFields, useReorderCustomFields, useUpdateCustomField } from '../hooks/use-settings'

export function CustomFieldsSettingsPage() {
  const { canSection } = usePermission()
  const fields = useCustomFields()
  const [entity, setEntity] = useState<CustomFieldEntity>('lead')
  const [editing, setEditing] = useState<CustomFieldDefinition | 'new' | null>(null)
  if (!canSection('custom_fields')) return <NoAccess />
  const blocked = queryBlocked(fields)
  if (blocked) return blocked
  const rows = (fields.data ?? []).filter((field) => field.entity === entity)
  return (
    <div>
      <SectionIntro title="Custom fields" description="Archived fields stay on records and disappear from forms, filters and import mapping." actions={<Button onClick={() => setEditing('new')}>Add field</Button>} />
      <Tabs value={entity} onValueChange={(value) => setEntity(value as CustomFieldEntity)}>
        <TabsList>
          {CUSTOM_FIELD_ENTITIES.map((item) => (
            <TabsTrigger key={item} value={item}>{item}</TabsTrigger>
          ))}
        </TabsList>
        {CUSTOM_FIELD_ENTITIES.map((item) => (
          <TabsContent key={item} value={item} forceMount className="sr-only">{item}</TabsContent>
        ))}
      </Tabs>
      <div className="mt-4">
        <FieldList rows={rows} onEdit={setEditing} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Active lead fields also appear on the lead drawer, the filter builder and import targets.
      </p>
      <FieldEditor entity={entity} editing={editing} onClose={() => setEditing(null)} />
      <div className="mt-6 rounded-md border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">Preview</h3>
        <DynamicFields fields={activeFields(fields.data ?? [], entity)} values={{}} onChange={() => undefined} />
      </div>
    </div>
  )
}

function FieldList({ rows, onEdit }: { rows: CustomFieldDefinition[]; onEdit: (field: CustomFieldDefinition) => void }) {
  const reorder = useReorderCustomFields()
  const update = useUpdateCustomField()
  return (
    <SortableList
      items={rows}
      onReorder={(ids) => reorder.mutateAsync(ids)}
      renderItem={(field) => (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="text-sm font-medium" onClick={() => onEdit(field)}>{field.label}</button>
          <Badge>{field.type}</Badge>
          <span className="text-xs text-muted-foreground">{field.key}</span>
          {field.archived ? <Badge>Archived</Badge> : null}
          <Switch checked={field.archived !== true} onCheckedChange={(active) => update.mutate({ id: field.id, patch: { archived: !active } })} aria-label={`Active ${field.label}`} />
        </div>
      )}
    />
  )
}

function FieldEditor({
  entity,
  editing,
  onClose,
}: {
  entity: CustomFieldEntity
  editing: CustomFieldDefinition | 'new' | null
  onClose: () => void
}) {
  const create = useCreateCustomField()
  const update = useUpdateCustomField()
  const existing = editing !== 'new' ? editing : null
  const [label, setLabel] = useState(existing?.label ?? '')
  const [type, setType] = useState(existing?.type ?? 'text')
  const [options, setOptions] = useState((existing?.options ?? []).join('\n'))
  const [required, setRequired] = useState(existing?.required ?? false)
  const key = existing?.key ?? fieldKeyFromLabel(label)
  const preview = useMemo(() => existing ?? null, [existing])
  void preview
  return (
    <Drawer open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{existing ? 'Edit field' : 'New field'}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="space-y-3">
          <label className="block space-y-1 text-sm font-medium">
            Label
            <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Field label" />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Key
            <Input value={key} readOnly />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Type
            <Select value={type} options={CUSTOM_FIELD_TYPES.map((item) => ({ value: item, label: item }))} onValueChange={(value) => setType(value as typeof type)} />
          </label>
          {type === 'dropdown' || type === 'multiselect' ? (
            <label className="block space-y-1 text-sm font-medium">
              Options
              <textarea className="min-h-24 w-full rounded-md border border-input bg-surface p-2 text-sm font-normal max-sm:text-base" value={options} onChange={(event) => setOptions(event.target.value)} />
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={required} onCheckedChange={setRequired} aria-label="Required" /> Required
          </label>
          <Button
            onClick={() => {
              const payload = { label, type, options: options.split('\n').map((line) => line.trim()).filter(Boolean), required, entity, key, helpText: '', showInTable: false }
              const done = () => { toast.success('Field saved'); onClose() }
              if (existing) update.mutate({ id: existing.id, patch: payload }, { onSuccess: done })
              else create.mutate(payload, { onSuccess: done })
            }}
          >
            Save field
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
