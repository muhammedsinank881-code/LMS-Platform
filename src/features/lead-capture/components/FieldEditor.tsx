import { FormField } from '@/components/common/FormField'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  Switch,
  Textarea,
} from '@/components/ui'
import { FORM_INPUT_TYPES, type FormInputType, type LeadFormField } from '@/types'

const TYPE_LABEL: Record<FormInputType, string> = {
  text: 'Short text',
  email: 'Email',
  tel: 'Phone',
  number: 'Number',
  textarea: 'Long text',
  select: 'Dropdown',
}

const numberOrUndefined = (value: string) => (value === '' || Number.isNaN(Number(value)) ? undefined : Number(value))

/** Edits one field's label, placeholder, requirement, input type, dropdown options and validation. */
export function FieldEditor({
  field,
  error,
  onChange,
  onClose,
}: {
  field: LeadFormField | null
  error?: string
  onChange: (field: LeadFormField) => void
  onClose: () => void
}) {
  return (
    <Modal open={field !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
        {field ? (
          <>
            <ModalHeader>
              <ModalTitle>Edit field</ModalTitle>
              <ModalDescription>Maps to the lead field “{field.key}”.</ModalDescription>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <FormField id="field-label" label="Label" required error={field.label.trim() ? undefined : 'Add a label'}>
                {(control) => <Input {...control} value={field.label} onChange={(event) => onChange({ ...field, label: event.target.value })} />}
              </FormField>
              <FormField id="field-placeholder" label="Placeholder">
                {(control) => <Input {...control} value={field.placeholder} onChange={(event) => onChange({ ...field, placeholder: event.target.value })} />}
              </FormField>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="field-required" className="text-sm font-medium">Required</label>
                <Switch id="field-required" checked={field.required} onCheckedChange={(required) => onChange({ ...field, required })} />
              </div>
              <FormField id="field-type" label="Input type">
                {(control) => (
                  <Select {...control} value={field.type} onValueChange={(type) => onChange({ ...field, type: type as FormInputType })} options={FORM_INPUT_TYPES.map((type) => ({ value: type, label: TYPE_LABEL[type] }))} />
                )}
              </FormField>
              {field.type === 'select' ? (
                <FormField id="field-options" label="Options" hint="One per line." error={error}>
                  {(control) => <Textarea {...control} rows={4} value={field.options.join('\n')} onChange={(event) => onChange({ ...field, options: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} />}
                </FormField>
              ) : null}
              {field.type !== 'select' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="field-min" label={field.type === 'number' ? 'Minimum value' : 'Minimum length'}>
                    {(control) => <Input {...control} type="number" value={field.validation.min ?? ''} onChange={(event) => onChange({ ...field, validation: { ...field.validation, min: numberOrUndefined(event.target.value) } })} />}
                  </FormField>
                  <FormField id="field-max" label={field.type === 'number' ? 'Maximum value' : 'Maximum length'}>
                    {(control) => <Input {...control} type="number" value={field.validation.max ?? ''} onChange={(event) => onChange({ ...field, validation: { ...field.validation, max: numberOrUndefined(event.target.value) } })} />}
                  </FormField>
                  <FormField id="field-pattern" label="Pattern" hint="Optional regular expression." className="sm:col-span-2" error={error}>
                    {(control) => <Input {...control} className="font-mono" value={field.validation.pattern ?? ''} onChange={(event) => onChange({ ...field, validation: { ...field.validation, pattern: event.target.value || undefined } })} />}
                  </FormField>
                </div>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Done</Button>
            </ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  )
}
