import { Mail, MessageCircle, MoreHorizontal, Phone, StickyNote } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  Tooltip,
} from '@/components/ui'
import type { Lead } from '@/types'
import { OpenInInboxMenu } from '@/features/inbox/components/OpenInInboxMenu'
import { mailtoHref, telHref, whatsappHref } from '../../lib/contact-links'
import type { ComposerTab } from './ActivityComposer'

export function LeadQuickActions({
  lead,
  canEdit,
  canAssign,
  canDelete,
  canConvertDeal,
  onCompose,
  onFollowUp,
  onConvertDeal,
  onEdit,
  onAssign,
  onDelete,
  onMerge,
  onReopen,
  showReopen,
}: {
  lead: Lead
  canEdit: boolean
  canAssign: boolean
  canDelete: boolean
  canConvertDeal: boolean
  onCompose: (tab: ComposerTab) => void
  onFollowUp: () => void
  onConvertDeal: () => void
  onEdit: () => void
  onAssign: () => void
  onDelete: () => void
  onMerge: () => void
  onReopen: () => void
  showReopen: boolean
}) {
  const call = telHref(lead.phone)
  const whatsapp = whatsappHref(lead.whatsapp ?? lead.phone)
  const email = mailtoHref(lead.email)

  return (
    <div className="hidden flex-wrap gap-1.5 lg:flex">
      <ActionLink href={call} label="Call" icon={Phone} />
      <ActionLink href={whatsapp} label="WhatsApp" icon={MessageCircle} />
      <ActionLink href={email} label="Email" icon={Mail} />
      <OpenInInboxMenu lead={lead} />
      <Button type="button" size="sm" variant="outline" disabled={!canEdit} onClick={() => onCompose('note')}>
        <StickyNote /> Add note
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={!canEdit} onClick={() => onCompose('call')}>
        Log call
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onFollowUp}>
        Schedule follow-up
      </Button>
      <Tooltip content={canConvertDeal ? 'Create an opportunity' : 'Available for qualified leads without a deal'}>
        <span>
          <Button type="button" size="sm" variant="outline" disabled={!canConvertDeal} onClick={onConvertDeal}>
            Convert to deal
          </Button>
        </span>
      </Tooltip>
      <Button type="button" size="sm" variant="outline" disabled={!canEdit} onClick={onEdit}>
        Edit
      </Button>
      {showReopen ? (
        <Button type="button" size="sm" variant="outline" disabled={!canEdit} onClick={onReopen}>
          Reopen
        </Button>
      ) : null}
      <Dropdown>
        <DropdownTrigger asChild>
          <Button type="button" variant="outline" size="icon-sm" aria-label="More actions">
            <MoreHorizontal />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem disabled={!canAssign} onSelect={onAssign}>
            Assign
          </DropdownItem>
          <DropdownItem disabled={!canEdit} onSelect={onMerge}>
            Merge
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive disabled={!canDelete} onSelect={onDelete}>
            Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  )
}

function ActionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string | null
  label: string
  icon: typeof Phone
}) {
  if (!href) {
    return (
      <Button type="button" size="sm" variant="outline" disabled>
        <Icon /> {label}
      </Button>
    )
  }
  return (
    <Button asChild size="sm" variant="outline">
      <a href={href}>
        <Icon /> {label}
      </a>
    </Button>
  )
}
