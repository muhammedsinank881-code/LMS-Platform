import { CopyField } from '@/components/common/CopyField'
import { Button, Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui'
import type { ApiKey } from '@/types'
import { curlForKey } from '../lib/snippets'

/** A ready-to-run request for a key, with the key masked. Paste your real key where the bullets are. */
export function CurlDialog({ apiKey, onClose }: { apiKey: ApiKey | null; onClose: () => void }) {
  return (
    <Modal open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle>Test with cURL</ModalTitle>
          <ModalDescription>The key is masked. Replace it with the full key you saved when it was created.</ModalDescription>
        </ModalHeader>
        <ModalBody>{apiKey ? <CopyField label="cURL command" value={curlForKey(apiKey)} multiline /> : null}</ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
