import { useState } from 'react'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  Textarea,
} from '@/components/ui'
import { Section, Specimen } from './Section'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
type DrawerSide = 'right' | 'left' | 'bottom'
type DrawerSize = 'sm' | 'md' | 'lg'

const OWNERS = [
  { value: 'rahul', label: 'Rahul' },
  { value: 'priya', label: 'Priya' },
  { value: 'anil', label: 'Anil' },
]

export function ModalSection() {
  const [size, setSize] = useState<ModalSize | null>(null)

  return (
    <Section
      id="modal"
      title="Modal"
      description="Focus is trapped, Esc and the close button dismiss, focus returns to the trigger."
    >
      <Specimen label="Sizes">
        {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Button key={s} variant="outline" onClick={() => setSize(s)}>
            Open {s}
          </Button>
        ))}
      </Specimen>
      <Modal open={size !== null} onOpenChange={(open) => !open && setSize(null)}>
        <ModalContent size={size ?? 'md'}>
          <ModalHeader>
            <ModalTitle>Reassign lead</ModalTitle>
            <ModalDescription>The new owner is notified immediately.</ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label id="modal-owner-label">New owner</Label>
              <Select
                aria-labelledby="modal-owner-label"
                options={OWNERS}
                placeholder="Choose owner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-reason">Reason</Label>
              <Input id="modal-reason" placeholder="Optional" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSize(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSize(null)}>Reassign</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Section>
  )
}

export function DrawerSection() {
  const [config, setConfig] = useState<{ side: DrawerSide; size: DrawerSize } | null>(null)
  const open = (side: DrawerSide, size: DrawerSize) => setConfig({ side, size })

  return (
    <Section
      id="drawer"
      title="Drawer"
      description="Right drawer is the default for create/edit forms. Full width on mobile."
    >
      <Specimen label="Right (sm / md / lg)">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <Button key={s} variant="outline" onClick={() => open('right', s)}>
            Right {s}
          </Button>
        ))}
      </Specimen>
      <Specimen label="Other sides">
        <Button variant="outline" onClick={() => open('left', 'md')}>
          Left
        </Button>
        <Button variant="outline" onClick={() => open('bottom', 'md')}>
          Bottom sheet
        </Button>
      </Specimen>
      <Drawer open={config !== null} onOpenChange={(isOpen) => !isOpen && setConfig(null)}>
        <DrawerContent side={config?.side} size={config?.size}>
          <DrawerHeader>
            <DrawerTitle>Add lead</DrawerTitle>
            <DrawerDescription>Capture the basics now, enrich later.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drawer-name" required>
                Name
              </Label>
              <Input id="drawer-name" required placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-phone">Phone</Label>
              <Input id="drawer-phone" type="tel" placeholder="+91" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-note">Requirement</Label>
              <Textarea id="drawer-note" placeholder="What are they looking for?" />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setConfig(null)}>
              Cancel
            </Button>
            <Button onClick={() => setConfig(null)}>Save lead</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Section>
  )
}
