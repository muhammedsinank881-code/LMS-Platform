import { useState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Select } from '@/components/ui'
import type { ApiKey } from '@/types'
import { useRotateApiKey } from '../hooks/use-api-keys'

const GRACE = [
  { value: '0', label: 'None: revoke the old key now' },
  { value: '1', label: '1 hour' },
  { value: '24', label: '24 hours' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days' },
]

/** Issues a replacement key. A grace period lets deployed integrations switch over without downtime. */
export function RotateKeyDialog({ apiKey, onClose, onRotated }: { apiKey: ApiKey | null; onClose: () => void; onRotated: (secret: string) => void }) {
  const rotate = useRotateApiKey()
  const [grace, setGrace] = useState('24')
  return (
    <Modal open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Rotate “{apiKey?.name}”</ModalTitle>
          <ModalDescription>A new key is created with the same scopes. You will see it once.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-2">
          <label htmlFor="grace" className="text-sm font-medium">Keep the old key working for</label>
          <Select id="grace" value={grace} onValueChange={setGrace} options={GRACE} />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            loading={rotate.isPending}
            onClick={() => apiKey && rotate.mutate({ id: apiKey.id, graceHours: Number(grace) }, { onSuccess: ({ secret }) => { onRotated(secret); rotate.reset(); onClose() } })}
          >
            Rotate key
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
