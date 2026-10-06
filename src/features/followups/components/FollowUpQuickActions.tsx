import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, CalendarClock, Check, Mail, MessageCircle, MoreHorizontal, Phone } from 'lucide-react'
import { rememberLeadListSearch } from '@/features/leads/lib/list-return'
import { mailtoHref, telHref, whatsappHref } from '@/features/leads/lib/contact-links'
import { Button, Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { minutesUntilTomorrowMorning } from '@/lib/followup-schedule'
import { SnoozeMenu } from './SnoozeMenu'

export interface FollowUpQuickActionsProps {
  leadId: string
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  onComplete: () => void
  onReschedule: () => void
  onSnooze: (minutes: number) => void
}

function ContactLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (!href) return null
  return (
    <Button asChild variant="ghost" size="icon-sm">
      <a href={href} aria-label={label}>
        {children}
      </a>
    </Button>
  )
}

export function FollowUpQuickActions(props: FollowUpQuickActionsProps) {
  const { can } = usePermission()
  const location = useLocation()
  const canEdit = can('followups', 'edit')
  const tel = telHref(props.phone)
  const wa = whatsappHref(props.whatsapp ?? props.phone)
  const mail = mailtoHref(props.email)
  const openLead = () => rememberLeadListSearch(location.search)

  return (
    <div className="flex items-center gap-1">
      <Dropdown>
        <DropdownTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Follow-up actions" className="md:hidden">
            <MoreHorizontal />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          {tel ? (
            <DropdownItem asChild>
              <a href={tel}>Call</a>
            </DropdownItem>
          ) : null}
          {wa ? (
            <DropdownItem asChild>
              <a href={wa}>WhatsApp</a>
            </DropdownItem>
          ) : null}
          {mail ? (
            <DropdownItem asChild>
              <a href={mail}>Email</a>
            </DropdownItem>
          ) : null}
          <DropdownItem disabled={!canEdit} onSelect={props.onComplete}>
            Mark done
          </DropdownItem>
          <DropdownItem disabled={!canEdit} onSelect={props.onReschedule}>
            Reschedule
          </DropdownItem>
          <DropdownItem disabled={!canEdit} onSelect={() => props.onSnooze(15)}>
            Snooze 15 min
          </DropdownItem>
          <DropdownItem disabled={!canEdit} onSelect={() => props.onSnooze(60)}>
            Snooze 1 hour
          </DropdownItem>
          <DropdownItem
            disabled={!canEdit}
            onSelect={() => props.onSnooze(minutesUntilTomorrowMorning(new Date()))}
          >
            Snooze until tomorrow
          </DropdownItem>
          <DropdownItem asChild>
            <Link to={`/leads/${props.leadId}`} onClick={openLead}>
              Open lead
            </Link>
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
      <div className="hidden items-center gap-1 md:flex">
        <ContactLink href={tel} label="Call">
          <Phone />
        </ContactLink>
        <ContactLink href={wa} label="WhatsApp">
          <MessageCircle />
        </ContactLink>
        <ContactLink href={mail} label="Email">
          <Mail />
        </ContactLink>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Mark done" disabled={!canEdit} onClick={props.onComplete}>
          <Check />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Reschedule" disabled={!canEdit} onClick={props.onReschedule}>
          <CalendarClock />
        </Button>
        <SnoozeMenu disabled={!canEdit} onSnooze={props.onSnooze} />
        <Button asChild variant="ghost" size="icon-sm">
          <Link to={`/leads/${props.leadId}`} aria-label="Open lead" onClick={openLead}>
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}
