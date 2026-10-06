import { Smile } from 'lucide-react'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

const EMOJIS = ['🙂', '😀', '🙏', '👍', '🎉', '✅', '📞', '📎', '💡', '🔥']

export function EmojiInsert({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Insert emoji">
          <Smile />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-48 grid-cols-5 gap-1 p-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="rounded-md p-1 text-lg hover:bg-muted"
            onClick={() => onPick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
