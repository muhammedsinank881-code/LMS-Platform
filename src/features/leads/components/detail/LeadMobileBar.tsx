import { MessageCircle, Phone, StickyNote } from 'lucide-react'
import { Button, Select } from '@/components/ui'
import { OpenInInboxMenu } from '@/features/inbox/components/OpenInInboxMenu'
import type { Lead } from '@/types'
import { telHref, whatsappHref } from '../../lib/contact-links'
import type { LeadLookups } from '../../types'

export function LeadMobileBar({
  lead,
  lookups,
  canEdit,
  onNote,
  onStatus,
}: {
  lead: Lead
  lookups: LeadLookups
  canEdit: boolean
  onNote: () => void
  onStatus: (statusId: string) => void
}) {
  const call = telHref(lead.phone)
  const whatsapp = whatsappHref(lead.whatsapp ?? lead.phone)
  const statuses = [...lookups.statuses].sort((a, b) => a.order - b.order)

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <IconLink href={call} label="Call" icon={Phone} />
        <IconLink href={whatsapp} label="WhatsApp" icon={MessageCircle} />
        <OpenInInboxMenu lead={lead} iconOnly />
        <Button type="button" variant="outline" size="icon" aria-label="Add note" disabled={!canEdit} onClick={onNote}>
          <StickyNote />
        </Button>
        <Select
          aria-label="Status"
          className="min-w-0 flex-1"
          disabled={!canEdit}
          value={lead.statusId}
          options={statuses.map((status) => ({
            value: status.id,
            label: status.name,
            disabled: Boolean(lead.convertedToCustomerId) && status.type === 'won',
          }))}
          onValueChange={onStatus}
        />
      </div>
    </div>
  )
}

function IconLink({ href, label, icon: Icon }: { href: string | null; label: string; icon: typeof Phone }) {
  if (!href) {
    return (
      <Button type="button" variant="outline" size="icon" aria-label={label} disabled>
        <Icon />
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" size="icon" aria-label={label}>
      <a href={href}>
        <Icon />
      </a>
    </Button>
  )
}
