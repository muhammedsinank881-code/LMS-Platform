import { useState } from 'react'
import { LayoutTemplate, Send, StickyNote, X } from 'lucide-react'
import { Button, Textarea, Tooltip } from '@/components/ui'
import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/cn'
import { getWhatsAppWindow } from '@/lib/inbox/whatsapp-window'
import type { Conversation, Lead, MessageAttachment } from '@/types'
import { useAddInternalNote, useSendMessage } from '../../hooks/use-conversations'
import { useQuickReplies } from '../../hooks/use-quick-replies'
import { handleComposerKey } from '../../lib/composer-keys'
import { useComposerSettings } from '../../lib/composer-settings'
import { applyQuickReplyShortcut } from '../../lib/quick-reply'
import { AttachmentPicker } from './AttachmentPicker'
import { EmojiInsert } from './EmojiInsert'
import { EnterToSend } from './EnterToSend'
import { QuickReplyMenu } from './QuickReplyMenu'
import { TemplatePicker, type PickedTemplate } from './TemplatePicker'
import { TemplatePreview } from './TemplatePreview'
import { WindowLock } from './WindowLock'

export function WhatsAppComposer({
  conversation,
  lead,
  owner,
}: {
  conversation: Conversation
  lead?: Lead | null
  owner?: { name: string } | null
}) {
  const send = useSendMessage()
  const note = useAddInternalNote()
  const replies = useQuickReplies()
  const enterToSend = useComposerSettings((state) => state.enterToSend)
  const now = useNow(30_000)
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [template, setTemplate] = useState<PickedTemplate | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [noteMode, setNoteMode] = useState(false)
  const window = getWhatsAppWindow(conversation.windowExpiresAt, now)
  const closed = conversation.status === 'closed'
  const locked = !window.canFreeText && !noteMode
  const busy = send.isPending || note.isPending
  const canSend = noteMode
    ? body.trim().length > 0
    : template !== null || (!locked && (body.trim().length > 0 || attachments.length > 0))

  const submit = () => {
    if (!canSend || busy || closed) return
    if (noteMode) {
      note.mutate({ id: conversation.id, body: body.trim() }, { onSuccess: () => setBody('') })
      return
    }
    send.mutate(
      {
        id: conversation.id,
        input: template
          ? { body: template.text, templateId: template.template.id, templateVariables: template.variables }
          : { body: body.trim(), attachments },
      },
      {
        onSuccess: () => {
          setBody('')
          setAttachments([])
          setTemplate(null)
        },
      },
    )
  }

  const placeholder = closed
    ? 'This conversation is closed. Reopen it to reply.'
    : noteMode
      ? 'Write an internal note. It is never sent to the customer.'
      : locked
        ? 'Free text is locked until the customer replies'
        : 'Write a message'

  return (
    <div className={cn('space-y-2 p-3 sm:px-4', noteMode && 'bg-warning/5')}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {noteMode ? (
          <p className="text-xs font-medium text-foreground">Internal note: only your team can see it.</p>
        ) : (
          <WindowLock expiresAt={conversation.windowExpiresAt} now={now} onPickTemplate={() => setPickerOpen(true)} />
        )}
        {window.canFreeText || noteMode ? <EnterToSend /> : null}
      </div>
      {template && !noteMode ? (
        <div className="relative">
          <TemplatePreview
            channel="whatsapp"
            header={template.template.header}
            body={template.text}
            footer={template.template.footer}
            buttons={template.template.buttons}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute right-1 top-1"
            aria-label="Remove template"
            onClick={() => setTemplate(null)}
          >
            <X />
          </Button>
        </div>
      ) : (
        <Textarea
          aria-label={noteMode ? 'Internal note' : 'WhatsApp message'}
          rows={2}
          value={body}
          disabled={closed || locked}
          placeholder={placeholder}
          className={cn('min-h-16 resize-none', noteMode && 'border-warning/50')}
          onChange={(event) => setBody(noteMode ? event.target.value : applyQuickReplyShortcut(event.target.value, replies.data ?? []))}
          onKeyDown={(event) => handleComposerKey(event, enterToSend, submit)}
        />
      )}
      {attachments.length > 0 && !template ? <AttachmentPicker files={attachments} onChange={setAttachments} listOnly /> : null}
      <div className="flex flex-wrap items-center gap-1">
        <Tooltip content="Send an approved template">
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Template" disabled={closed || noteMode} onClick={() => setPickerOpen(true)}>
            <LayoutTemplate />
          </Button>
        </Tooltip>
        {!locked && !template && !noteMode ? <AttachmentPicker files={attachments} onChange={setAttachments} buttonOnly /> : null}
        {!locked && !template ? <EmojiInsert onPick={(emoji) => setBody((current) => `${current}${emoji}`)} /> : null}
        {!locked && !template && !noteMode ? <QuickReplyMenu channel="whatsapp" onPick={(text) => setBody((current) => `${current}${text}`)} /> : null}
        <Tooltip content="Internal note: visible to your team only">
          <Button
            type="button"
            size="icon-sm"
            variant={noteMode ? 'secondary' : 'ghost'}
            aria-pressed={noteMode}
            aria-label="Internal note"
            disabled={closed}
            onClick={() => {
              setNoteMode((value) => !value)
              setTemplate(null)
            }}
          >
            <StickyNote />
          </Button>
        </Tooltip>
        <div className="min-w-2 flex-1" />
        <Button type="button" size="sm" disabled={!canSend || closed} loading={busy} onClick={submit}>
          <Send /> {noteMode ? 'Add note' : 'Send'}
        </Button>
      </div>
      <TemplatePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        channel="whatsapp"
        lead={lead}
        owner={owner}
        onPick={(picked) => {
          setTemplate(picked)
          setNoteMode(false)
        }}
      />
    </div>
  )
}
