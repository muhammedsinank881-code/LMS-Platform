import { useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  MultiSelect,
} from '@/components/ui'
import { FormField } from '@/components/common/FormField'
import type { Tag } from '@/types'

export interface TagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'remove'
  tags: Tag[]
  count: number
  loading?: boolean
  onSubmit: (tags: string[]) => void
}

export function TagsDialog({
  open,
  onOpenChange,
  mode,
  tags,
  count,
  loading,
  onSubmit,
}: TagsDialogProps) {
  const [value, setValue] = useState<string[]>([])
  const title = mode === 'add' ? 'Add tags' : 'Remove tags'
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) setValue([])
        onOpenChange(next)
      }}
    >
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>
            {mode === 'add' ? 'Add' : 'Remove'} tags on {count} {count === 1 ? 'lead' : 'leads'}.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <FormField id="bulk-tags" label="Tags" required>
            {(control) => (
              <MultiSelect
                {...control}
                options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
                value={value}
                onValueChange={setValue}
              />
            )}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={loading} disabled={value.length === 0} onClick={() => onSubmit(value)}>
            {title}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
