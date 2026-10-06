import { useState } from 'react'
import { FormField } from '@/components/common/FormField'
import { Button, DatePicker, Input, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui'
import { computeExpectedRevenue } from '@/lib/pipeline'

export function CloseWonDialog({
  open,
  value,
  loading,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  value: number
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: { closedAt: string; finalValue: number }) => void
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(value)
  const revenue = computeExpectedRevenue(amount || 0, 100)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Close deal as won</ModalTitle>
          <ModalDescription>Record the actual close date and the final value. Expected revenue at 100% is shown below.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <FormField id="close-date" label="Actual close date" required>
            {(control) => <DatePicker {...control} value={date} onValueChange={setDate} />}
          </FormField>
          <FormField id="close-value" label="Final value" required>
            {(control) => (
              <Input
                {...control}
                type="number"
                min={0}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            )}
          </FormField>
          <p className="text-sm text-muted-foreground">Expected revenue {revenue.toLocaleString('en-IN')}</p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" loading={loading} onClick={() => onConfirm({ closedAt: new Date(date).toISOString(), finalValue: amount })}>
            Close won
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
