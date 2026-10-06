import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ExternalLink, MoreVertical, PanelRight, Phone, RotateCcw, UserRound, XCircle } from 'lucide-react'
import {
  Badge,
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
  Tooltip,
} from '@/components/ui'
import { telHref } from '@/features/leads/lib/contact-links'
import { useNow } from '@/hooks/use-now'
import { usePermission } from '@/hooks/use-permission'
import { contactLabel } from '@/lib/inbox/auto-link'
import { getWhatsAppWindow } from '@/lib/inbox/whatsapp-window'
import { formatPhone } from '@/lib/phone'
import type { Conversation } from '@/types'
import {
  useAssignConversation,
  useCloseConversation,
  useReopenConversation,
} from '../hooks/use-conversations'
import { channelLabel } from '../lib/channel'
import { ContactAvatar } from './ContactAvatar'

const WINDOW_TONE = { open: 'success', closing_soon: 'warning', expired: 'neutral' } as const

function WindowChip({ expiresAt }: { expiresAt: string | null }) {
  const now = useNow(30_000)
  const window = getWhatsAppWindow(expiresAt, now)
  return (
    <Tooltip content="WhatsApp only allows free-form replies for 24 hours after the customer's last message.">
      <span className="inline-flex">
        <Badge size="sm" tone={WINDOW_TONE[window.state]}>
          {window.state === 'expired' ? window.label : `24h window · ${window.label.replace('Open · ', '')}`}
        </Badge>
      </span>
    </Tooltip>
  )
}

export function ThreadHeader({
  conversation,
  leadName,
  members,
  onLogCall,
  showBack,
  showInfoButton,
  onOpenInfo,
}: {
  conversation: Conversation
  leadName?: string | null
  members: Array<{ id: string; name: string }>
  onLogCall: () => void
  showBack: boolean
  showInfoButton: boolean
  onOpenInfo: () => void
}) {
  const { can } = usePermission()
  const assign = useAssignConversation()
  const close = useCloseConversation()
  const reopen = useReopenConversation()
  const navigate = useNavigate()
  const heading = useRef<HTMLHeadingElement>(null)
  const title = contactLabel({
    leadName,
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    contactEmail: conversation.contactEmail,
  })
  const tel = telHref(conversation.contactPhone)
  const owner = members.find((user) => user.id === conversation.assignedTo)
  const detail = [
    channelLabel(conversation.channel),
    conversation.contactPhone ? formatPhone(conversation.contactPhone) : null,
    conversation.contactEmail,
  ]
    .filter(Boolean)
    .join(' · ')

  useEffect(() => {
    heading.current?.focus()
  }, [conversation.id])

  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 sm:px-4">
      {showBack ? (
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Back to inbox" onClick={() => navigate('/inbox')}>
          <ArrowLeft />
        </Button>
      ) : null}
      <ContactAvatar name={title} channel={conversation.channel} />
      <div className="min-w-0 flex-1">
        <h2
          ref={heading}
          tabIndex={-1}
          className="truncate rounded-sm text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {conversation.leadId ? (
            <Link to={`/leads/${conversation.leadId}`} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {conversation.channel === 'whatsapp' ? <WindowChip expiresAt={conversation.windowExpiresAt} /> : null}
          <Badge size="sm" tone={owner ? 'neutral' : 'warning'}>
            {owner ? owner.name : 'Unassigned'}
          </Badge>
          {conversation.status === 'closed' ? (
            <Badge size="sm" tone="neutral">
              Closed
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {tel ? (
          <Tooltip content="Call with your phone, then log the call">
            <Button type="button" size="icon-sm" variant="outline" aria-label="Call" onClick={onLogCall}>
              <Phone />
            </Button>
          </Tooltip>
        ) : null}
        {showInfoButton ? (
          <Tooltip content="Contact details">
            <Button type="button" size="icon-sm" variant="outline" aria-label="Contact details" onClick={onOpenInfo}>
              <PanelRight />
            </Button>
          </Tooltip>
        ) : null}
        <Dropdown>
          <DropdownTrigger asChild>
            <Button type="button" size="icon-sm" variant="outline" aria-label="More actions">
              <MoreVertical />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-56">
            {conversation.leadId ? (
              <DropdownItem asChild>
                <Link to={`/leads/${conversation.leadId}`}>
                  <ExternalLink className="h-4 w-4" /> Open lead
                </Link>
              </DropdownItem>
            ) : null}
            {can('inbox', 'assign') ? (
              <DropdownSub>
                <DropdownSubTrigger>
                  <UserRound className="h-4 w-4" /> Assign to
                </DropdownSubTrigger>
                <DropdownSubContent className="max-h-72 overflow-y-auto">
                  <DropdownItem onSelect={() => assign.mutate({ id: conversation.id, userId: null })}>
                    Unassigned {!conversation.assignedTo ? <Check className="ml-auto h-4 w-4" /> : null}
                  </DropdownItem>
                  {members.map((user) => (
                    <DropdownItem key={user.id} onSelect={() => assign.mutate({ id: conversation.id, userId: user.id })}>
                      {user.name} {user.id === conversation.assignedTo ? <Check className="ml-auto h-4 w-4" /> : null}
                    </DropdownItem>
                  ))}
                </DropdownSubContent>
              </DropdownSub>
            ) : null}
            <DropdownSeparator />
            {conversation.status === 'open' ? (
              <DropdownItem disabled={!can('inbox', 'edit')} onSelect={() => close.mutate(conversation.id)}>
                <XCircle className="h-4 w-4" /> Close conversation
              </DropdownItem>
            ) : (
              <DropdownItem disabled={!can('inbox', 'edit')} onSelect={() => reopen.mutate(conversation.id)}>
                <RotateCcw className="h-4 w-4" /> Reopen conversation
              </DropdownItem>
            )}
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  )
}
