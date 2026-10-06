import { useState } from 'react'
import { LayoutTemplate, Save, Send } from 'lucide-react'
import { Button, Input, Switch, toast, Tooltip } from '@/components/ui'
import { htmlToText, looksLikeHtml } from '@/lib/inbox/sanitize-html'
import { useAuthStore } from '@/store/auth-store'
import type { Conversation, Lead, MessageAttachment } from '@/types'
import { useSaveDraft, useSendMessage } from '../../hooks/use-conversations'
import { AttachmentPicker } from './AttachmentPicker'
import { RichTextBody } from './RichTextBody'
import { TemplatePicker, type PickedTemplate } from './TemplatePicker'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Comma-separated address list. Empty is fine (Cc and Bcc are optional). */
function validList(value: string): boolean {
  return value.split(',').map((item) => item.trim()).filter(Boolean).every((item) => EMAIL.test(item))
}

function toHtml(text: string): string {
  return looksLikeHtml(text) ? text : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')
}

export function EmailComposer({
  conversation,
  lead,
  owner,
}: {
  conversation: Conversation
  lead?: Lead | null
  owner?: { name: string } | null
}) {
  const send = useSendMessage()
  const draft = useSaveDraft()
  const workspace = useAuthStore((state) => state.tenant?.name ?? 'LeadFlow')
  const userName = useAuthStore((state) => state.user?.name ?? '')
  const saved = conversation.emailDraft
  const [to, setTo] = useState(saved?.to ?? conversation.contactEmail ?? lead?.email ?? '')
  const [cc, setCc] = useState(saved?.cc ?? '')
  const [bcc, setBcc] = useState(saved?.bcc ?? '')
  const [showCopies, setShowCopies] = useState(Boolean(saved?.cc || saved?.bcc))
  const [subject, setSubject] = useState(saved?.subject ?? (conversation.subject ? `Re: ${conversation.subject.replace(/^re:\s*/i, '')}` : ''))
  const [body, setBody] = useState(saved?.body ?? '')
  const [templateId, setTemplateId] = useState<string | undefined>()
  const [files, setFiles] = useState<MessageAttachment[]>([])
  const [sign, setSign] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draftSaved, setDraftSaved] = useState(Boolean(saved))
  const closed = conversation.status === 'closed'
  const signature = `<br><br>— ${userName}<br>${workspace}`
  const valid = EMAIL.test(to.trim()) && validList(cc) && validList(bcc)
  const canSend = valid && subject.trim().length > 0 && htmlToText(body).length > 0 && !closed

  const submit = () => {
    if (!canSend || send.isPending) return
    send.mutate(
      {
        id: conversation.id,
        input: { body: sign ? `${body}${signature}` : body, subject: subject.trim(), to: to.trim(), cc, bcc, attachments: files, templateId },
      },
      {
        onSuccess: () => {
          setBody('')
          setFiles([])
          setTemplateId(undefined)
          setDraftSaved(false)
          toast.success('Email sent')
        },
      },
    )
  }

  const edit = <T,>(set: (value: T) => void) => (value: T) => {
    set(value)
    setDraftSaved(false)
  }

  const pick = (picked: PickedTemplate) => {
    setTemplateId(picked.template.id)
    setBody(toHtml(picked.text))
    if (picked.subject) setSubject(picked.subject)
    setDraftSaved(false)
  }

  return (
    <div className="space-y-2 p-3 sm:px-4">
      <div className="flex items-center gap-2">
        <label className="w-14 shrink-0 text-xs font-medium text-muted-foreground" htmlFor={`to-${conversation.id}`}>To</label>
        <Input id={`to-${conversation.id}`} type="email" value={to} disabled={closed} aria-invalid={to !== '' && !EMAIL.test(to.trim())} onChange={(event) => edit(setTo)(event.target.value)} />
        {!showCopies ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowCopies(true)}>
            Cc/Bcc
          </Button>
        ) : null}
      </div>
      {showCopies ? (
        <>
          <div className="flex items-center gap-2">
            <label className="w-14 shrink-0 text-xs font-medium text-muted-foreground" htmlFor={`cc-${conversation.id}`}>Cc</label>
            <Input id={`cc-${conversation.id}`} value={cc} placeholder="a@x.com, b@y.com" aria-invalid={!validList(cc)} onChange={(event) => edit(setCc)(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-14 shrink-0 text-xs font-medium text-muted-foreground" htmlFor={`bcc-${conversation.id}`}>Bcc</label>
            <Input id={`bcc-${conversation.id}`} value={bcc} aria-invalid={!validList(bcc)} onChange={(event) => edit(setBcc)(event.target.value)} />
          </div>
        </>
      ) : null}
      <div className="flex items-center gap-2">
        <label className="w-14 shrink-0 text-xs font-medium text-muted-foreground" htmlFor={`subject-${conversation.id}`}>Subject</label>
        <Input id={`subject-${conversation.id}`} value={subject} disabled={closed} onChange={(event) => edit(setSubject)(event.target.value)} />
      </div>
      <RichTextBody
        value={body}
        disabled={closed}
        onChange={edit(setBody)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            submit()
          }
        }}
      />
      {sign ? (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          — {userName} · {workspace}
        </p>
      ) : null}
      <AttachmentPicker files={files} onChange={setFiles} listOnly />
      <div className="flex flex-wrap items-center gap-1">
        <Tooltip content="Start from a template">
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Template" disabled={closed} onClick={() => setPickerOpen(true)}>
            <LayoutTemplate />
          </Button>
        </Tooltip>
        <AttachmentPicker files={files} onChange={setFiles} buttonOnly />
        <label className="ml-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={sign} onCheckedChange={setSign} aria-label="Include signature" />
          Signature
        </label>
        <div className="min-w-2 flex-1" />
        {draftSaved ? <span className="text-xs text-muted-foreground" role="status">Draft saved</span> : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={draft.isPending}
          disabled={closed || (!subject.trim() && htmlToText(body).length === 0)}
          onClick={() =>
            draft.mutate(
              { id: conversation.id, draft: { to, cc, bcc, subject, body } },
              { onSuccess: () => setDraftSaved(true) },
            )
          }
        >
          <Save /> Save draft
        </Button>
        <Tooltip content="Ctrl or ⌘ + Enter">
          <Button type="button" size="sm" disabled={!canSend} loading={send.isPending} onClick={submit}>
            <Send /> Send
          </Button>
        </Tooltip>
      </div>
      <TemplatePicker open={pickerOpen} onOpenChange={setPickerOpen} channel="email" lead={lead} owner={owner} onPick={pick} />
    </div>
  )
}
