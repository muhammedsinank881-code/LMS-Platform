import { useState } from 'react'
import { Pencil, Trash2, Zap } from 'lucide-react'
import { Badge, Button, EmptyState, Input, Select, Textarea, toast } from '@/components/ui'
import {
  useCreateQuickReply,
  useDeleteQuickReply,
  useQuickReplies,
  useUpdateQuickReply,
} from '@/features/inbox/hooks/use-quick-replies'
import type { QuickReply, TemplateChannel } from '@/types'

const SHORTCUT = /^\/[a-z0-9_-]{2,20}$/
const CHANNELS = [
  { value: 'any', label: 'All channels' },
  { value: 'whatsapp', label: 'WhatsApp only' },
  { value: 'email', label: 'Email only' },
]

function normalize(value: string): string {
  const raw = value.trim().toLowerCase().replace(/[^a-z0-9/_-]/g, '')
  return raw.startsWith('/') ? raw : `/${raw}`
}

export function QuickRepliesPanel() {
  const replies = useQuickReplies()
  const create = useCreateQuickReply()
  const update = useUpdateQuickReply()
  const remove = useDeleteQuickReply()
  const [editing, setEditing] = useState<QuickReply | null>(null)
  const [shortcut, setShortcut] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState('any')
  const slug = normalize(shortcut)
  const duplicate = (replies.data ?? []).some((item) => item.shortcut === slug && item.id !== editing?.id)
  const error = shortcut && !SHORTCUT.test(slug) ? 'Use 2 to 20 letters, numbers, - or _' : duplicate ? 'That shortcut is already used' : null
  const canSave = body.trim().length > 0 && SHORTCUT.test(slug) && !duplicate

  const reset = () => {
    setEditing(null)
    setShortcut('')
    setBody('')
    setChannel('any')
  }
  const save = () => {
    const input = { shortcut: slug, body, channel: channel === 'any' ? null : (channel as TemplateChannel) }
    const done = () => {
      reset()
      toast.success(editing ? 'Quick reply updated' : 'Quick reply saved')
    }
    if (editing) update.mutate({ id: editing.id, patch: input }, { onSuccess: done })
    else create.mutate(input, { onSuccess: done })
  }

  return (
    <section className="space-y-4" aria-labelledby="quick-replies-title">
      <div>
        <h2 id="quick-replies-title" className="text-base font-semibold">Quick replies</h2>
        <p className="text-sm text-muted-foreground">Short saved texts. Type the shortcut, like /pricing, in a WhatsApp message to insert it.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[10rem_1fr_11rem]">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Shortcut
          <Input aria-label="Shortcut" placeholder="/pricing" value={shortcut} invalid={Boolean(error)} onChange={(event) => setShortcut(event.target.value)} />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground md:row-span-2 md:col-start-2 md:row-start-1">
          Reply text
          <Textarea aria-label="Reply text" rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <div className="space-y-1 text-xs font-medium text-muted-foreground md:col-start-3 md:row-start-1">
          Available in
          <Select aria-label="Available in" value={channel} onValueChange={setChannel} options={CHANNELS} />
        </div>
        {error ? <p role="alert" className="text-xs text-destructive md:col-start-1 md:row-start-2">{error}</p> : null}
        <div className="flex gap-2 md:col-start-3 md:row-start-2 md:self-end md:justify-end">
          {editing ? <Button type="button" variant="ghost" onClick={reset}>Cancel</Button> : null}
          <Button type="button" disabled={!canSave} loading={create.isPending || update.isPending} onClick={save}>
            {editing ? 'Save changes' : 'Add reply'}
          </Button>
        </div>
      </div>
      {(replies.data ?? []).length === 0 ? (
        <EmptyState size="sm" icon={Zap} title="No quick replies yet" description="Save the answers you type most often." />
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2" aria-label="Quick replies">
          {(replies.data ?? []).map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">{item.shortcut}</code>
                  {item.channel ? <Badge size="sm" tone="neutral">{item.channel}</Badge> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`Edit ${item.shortcut}`}
                onClick={() => {
                  setEditing(item)
                  setShortcut(item.shortcut)
                  setBody(item.body)
                  setChannel(item.channel ?? 'any')
                }}
              >
                <Pencil />
              </Button>
              <Button type="button" size="icon-sm" variant="ghost" aria-label={`Delete ${item.shortcut}`} onClick={() => remove.mutate(item.id)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
