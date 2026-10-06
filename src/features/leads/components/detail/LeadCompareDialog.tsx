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
  Skeleton,
} from '@/components/ui'
import { EMPTY_VALUE } from '@/lib/format/shared'
import { isLeadId, MERGEABLE_FIELDS, type Lead, type LeadMergeChoices, type MergeableField, type MergeSide } from '@/types'
import { useLead } from '../../hooks/use-leads'

const LABELS: Record<MergeableField, string> = {
  name: 'Name',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  email: 'Email',
  company: 'Company',
  location: 'Location',
  sourceId: 'Source',
  campaignId: 'Campaign',
  productInterest: 'Product',
  budget: 'Budget',
  requirement: 'Requirement',
  leadType: 'Lead type',
  priority: 'Priority',
  language: 'Language',
  statusId: 'Status',
  assignedTo: 'Owner',
}

function show(value: Lead[MergeableField]): string {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  return String(value)
}

export function LeadCompareDialog({
  open,
  primary,
  secondaryId,
  loading,
  onOpenChange,
  onMerge,
  onKeepSeparate,
  onLink,
}: {
  open: boolean
  primary: Lead
  secondaryId: string | null
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onMerge: (choices: LeadMergeChoices) => void
  onKeepSeparate: () => void
  onLink: () => void
}) {
  const secondary = useLead(open && secondaryId && isLeadId(secondaryId) ? secondaryId : null)
  const [choices, setChoices] = useState<LeadMergeChoices>({})
  const other = secondary.data

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle>Compare leads</ModalTitle>
          <ModalDescription>Pick which value to keep for each field. Unlisted fields stay with {primary.name}.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          {secondary.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : other ? (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              <div className="hidden grid-cols-[8rem_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Field</span>
                <span>This lead</span>
                <span>{other.name}</span>
              </div>
              {MERGEABLE_FIELDS.map((field) => {
                const side: MergeSide = choices[field] ?? 'primary'
                return (
                  <div key={field} className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[8rem_1fr_1fr]">
                    <span className="text-muted-foreground">{LABELS[field]}</span>
                    <Choice label={show(primary[field])} pressed={side === 'primary'} onClick={() => setChoices({ ...choices, [field]: 'primary' })} />
                    <Choice label={show(other[field])} pressed={side === 'secondary'} onClick={() => setChoices({ ...choices, [field]: 'secondary' })} />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">That lead could not be loaded.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onKeepSeparate} disabled={!other}>
            Keep separate
          </Button>
          <Button type="button" variant="outline" onClick={onLink} disabled={!other}>
            Link records
          </Button>
          <Button type="button" loading={loading} disabled={!other} onClick={() => onMerge(choices)}>
            Merge into this lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function Choice({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 truncate rounded-md border px-3 py-2 text-left ${pressed ? 'border-primary bg-primary/10' : 'border-border'}`}
    >
      {label}
    </button>
  )
}
