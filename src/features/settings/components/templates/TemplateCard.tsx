import { Copy, Lock, Mail, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { Badge, Button, Tooltip } from '@/components/ui'
import { formatRelative } from '@/lib/format'
import type { MessageTemplate } from '@/types'
import { TEMPLATE_STATUS_LABEL, TEMPLATE_STATUS_TONE } from './status-meta'

export function TemplateCard({
  template,
  busy,
  onEdit,
  onClone,
  onSubmit,
  onDelete,
}: {
  template: MessageTemplate
  busy: boolean
  onEdit: () => void
  onClone: () => void
  onSubmit: () => void
  onDelete: () => void
}) {
  const Icon = template.channel === 'whatsapp' ? MessageCircle : Mail
  const approved = template.status === 'approved'
  const pending = template.status === 'pending'
  const needsApproval = template.channel === 'whatsapp' && (template.status === 'draft' || template.status === 'rejected')
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted" aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{template.name}</h3>
          <p className="text-xs capitalize text-muted-foreground">
            {template.channel} · {template.category} · {template.language.toUpperCase()}
          </p>
        </div>
        <Badge size="sm" tone={TEMPLATE_STATUS_TONE[template.status]}>
          {TEMPLATE_STATUS_LABEL[template.status]}
        </Badge>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{template.subject ? `${template.subject}: ` : ''}{template.body}</p>
      {template.status === 'rejected' && template.rejectionReason ? (
        <p role="alert" className="rounded-md bg-destructive/5 p-2 text-xs text-destructive">
          Rejected: {template.rejectionReason}
        </p>
      ) : null}
      {pending ? <p role="status" className="text-xs text-muted-foreground">In review. This usually takes a moment here.</p> : null}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className="mr-auto text-xs text-muted-foreground">
          {template.usageCount ?? 0} {template.usageCount === 1 ? 'use' : 'uses'} · updated {formatRelative(template.updatedAt)}
        </span>
        <Tooltip content={approved || pending ? 'Locked: clone to change' : 'Edit template'}>
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            {approved || pending ? <Lock /> : <Pencil />} {approved || pending ? 'View' : 'Edit'}
          </Button>
        </Tooltip>
        {needsApproval ? (
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onSubmit}>
            <Send /> {template.status === 'rejected' ? 'Resubmit' : 'Submit'}
          </Button>
        ) : null}
        <Tooltip content="Clone as a new draft">
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Clone ${template.name}`} disabled={busy} onClick={onClone}>
            <Copy />
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Delete ${template.name}`} onClick={onDelete}>
            <Trash2 />
          </Button>
        </Tooltip>
      </div>
    </li>
  )
}
