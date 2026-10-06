import { Inbox, Mail, MessageCircle, Phone } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui'
import { mailtoHref, telHref, whatsappHref } from '@/features/leads/lib/contact-links'
import { usePermission } from '@/hooks/use-permission'
import type { Channel, Lead } from '@/types'
import { useOpenInbox } from '../hooks/use-open-inbox'

type ContactLead = Pick<Lead, 'id' | 'phone' | 'whatsapp' | 'email'>

/**
 * Inbox shortcuts for a lead. Each channel appears twice, on purpose: "in Inbox" keeps the
 * conversation in LeadFlow, the plain link hands off to the phone, WhatsApp or mail app.
 * Channels the lead has no contact detail for are disabled, not hidden.
 */
export function InboxContactItems({ lead }: { lead: ContactLead }) {
  const inbox = useOpenInbox()
  const { can } = usePermission()
  const canOpen = can('inbox', 'create') && !inbox.isPending
  const phone = lead.whatsapp ?? lead.phone
  const open = (channel: Channel) => void inbox.open(lead.id, channel)
  const tel = telHref(lead.phone)
  const wa = whatsappHref(phone)
  const mail = mailtoHref(lead.email)
  return (
    <>
      <DropdownLabel>Open in Inbox</DropdownLabel>
      <DropdownItem disabled={!canOpen || !phone} onSelect={() => open('whatsapp')}>
        <MessageCircle className="h-4 w-4" /> WhatsApp thread
      </DropdownItem>
      <DropdownItem disabled={!canOpen || !lead.email} onSelect={() => open('email')}>
        <Mail className="h-4 w-4" /> Email thread
      </DropdownItem>
      <DropdownItem disabled={!canOpen || !phone} onSelect={() => open('call')}>
        <Phone className="h-4 w-4" /> Call log
      </DropdownItem>
      <DropdownSeparator />
      <DropdownLabel>Open in another app</DropdownLabel>
      <DropdownItem asChild disabled={!tel}>
        <a href={tel ?? undefined}>
          <Phone className="h-4 w-4" /> Call (phone app)
        </a>
      </DropdownItem>
      <DropdownItem asChild disabled={!wa}>
        <a href={wa ?? undefined} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" /> WhatsApp (wa.me)
        </a>
      </DropdownItem>
      <DropdownItem asChild disabled={!mail}>
        <a href={mail ?? undefined}>
          <Mail className="h-4 w-4" /> Email (mail app)
        </a>
      </DropdownItem>
    </>
  )
}

export function OpenInInboxMenu({ lead, iconOnly = false }: { lead: ContactLead; iconOnly?: boolean }) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        {iconOnly ? (
          <Button type="button" variant="outline" size="icon" aria-label="Contact in Inbox">
            <Inbox />
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm">
            <Inbox /> Inbox
          </Button>
        )}
      </DropdownTrigger>
      <DropdownContent align="end" className="w-60">
        <InboxContactItems lead={lead} />
      </DropdownContent>
    </Dropdown>
  )
}
