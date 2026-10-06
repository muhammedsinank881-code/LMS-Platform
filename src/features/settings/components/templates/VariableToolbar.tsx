import { Button } from '@/components/ui'
import { CORE_TEMPLATE_VARIABLES, TEMPLATE_VARIABLE_LABEL, customVariable } from '@/lib/inbox/template-variables'

export interface CustomFieldOption {
  key: string
  label: string
}

/** Click a variable to insert it where the cursor is. Custom fields come from the workspace. */
export function VariableToolbar({
  customFields,
  disabled,
  onInsert,
}: {
  customFields: CustomFieldOption[]
  disabled?: boolean
  onInsert: (token: string) => void
}) {
  const chip = (name: string, label: string) => (
    <Button
      key={name}
      type="button"
      size="sm"
      variant="outline"
      className="h-7 px-2 font-mono text-xs"
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onInsert(`{{${name}}}`)}
    >
      {name}
    </Button>
  )
  return (
    <div className="space-y-1.5" role="group" aria-label="Insert variable">
      <p className="text-xs font-medium text-muted-foreground">Insert a variable</p>
      <div className="flex flex-wrap gap-1.5">
        {CORE_TEMPLATE_VARIABLES.map((name) => chip(name, TEMPLATE_VARIABLE_LABEL[name]))}
        {customFields.map((field) => chip(customVariable(field.key), field.label))}
      </div>
    </div>
  )
}
