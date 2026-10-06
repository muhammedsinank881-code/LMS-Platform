import { Zap } from 'lucide-react'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { useQuickReplies } from '../../hooks/use-quick-replies'
import type { TemplateChannel } from '@/types'

export function QuickReplyMenu({
  channel,
  onPick,
}: {
  channel: TemplateChannel
  onPick: (body: string) => void
}) {
  const replies = useQuickReplies()
  const items = (replies.data ?? []).filter((item) => !item.channel || item.channel === channel)
  if (items.length === 0) return null
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Quick replies">
          <Zap />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-1 p-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            onClick={() => onPick(item.body)}
          >
            <span className="font-medium">{item.shortcut}</span>
            <span className="ml-2 text-muted-foreground">{item.body.slice(0, 48)}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
