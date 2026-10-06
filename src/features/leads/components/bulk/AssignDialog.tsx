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
  Select,
  Switch,
} from '@/components/ui'
import { FormField } from '@/components/common/FormField'
import type { DirectoryUser } from '@/services/api/team'

export interface AssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: DirectoryUser[]
  count: number
  loading?: boolean
  onAssign: (userId: string) => void
  onAutoAssign: () => void
}

export function AssignDialog({
  open,
  onOpenChange,
  users,
  count,
  loading,
  onAssign,
  onAutoAssign,
}: AssignDialogProps) {
  const [userId, setUserId] = useState<string>()
  const [auto, setAuto] = useState(false)
  const options = users
    .filter((user) => user.status === 'active')
    .map((user) => ({ value: user.id, label: user.name }))

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setUserId(undefined)
          setAuto(false)
        }
        onOpenChange(next)
      }}
    >
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Assign leads</ModalTitle>
          <ModalDescription>
            Assign {count} {count === 1 ? 'lead' : 'leads'} to a teammate, or auto-assign with
            workspace rules.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="auto-assign" className="text-sm font-medium">
              Auto-assign (round-robin)
            </label>
            <Switch id="auto-assign" checked={auto} onCheckedChange={setAuto} />
          </div>
          {auto ? null : (
            <FormField id="assign-user" label="Teammate" required>
              {(control) => (
                <Select
                  {...control}
                  options={options}
                  value={userId}
                  onValueChange={setUserId}
                  placeholder="Choose a person"
                />
              )}
            </FormField>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={!auto && !userId}
            onClick={() => (auto ? onAutoAssign() : userId && onAssign(userId))}
          >
            Assign
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
