import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Bold, Italic, Link2, List, ListOrdered } from 'lucide-react'
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@/components/ui'

const SAFE_URL = /^(https?:\/\/|mailto:)/i

/** Lightweight rich text: bold, italic, bulleted and numbered lists, and links. */
export function RichTextBody({
  value,
  onChange,
  onKeyDown,
  disabled,
}: {
  value: string
  onChange: (html: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  disabled?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const saved = useRef<Range | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState('https://')

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value
  }, [value])

  const run = (command: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    onChange(ref.current?.innerHTML ?? '')
  }

  const rememberSelection = () => {
    const selection = window.getSelection()
    saved.current = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null
  }

  const applyLink = () => {
    const href = url.trim()
    if (!SAFE_URL.test(href)) return
    ref.current?.focus()
    const selection = window.getSelection()
    if (saved.current && selection) {
      selection.removeAllRanges()
      selection.addRange(saved.current)
    }
    run('createLink', href)
    setLinkOpen(false)
    setUrl('https://')
  }

  const tool = (label: string, icon: React.ReactNode, command: string) => (
    <Tooltip content={label}>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => run(command)}
      >
        {icon}
      </Button>
    </Tooltip>
  )

  return (
    <div className="rounded-md border border-input bg-surface focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap gap-0.5 border-b border-border px-1 py-1">
        {tool('Bold', <Bold />, 'bold')}
        {tool('Italic', <Italic />, 'italic')}
        {tool('Bulleted list', <List />, 'insertUnorderedList')}
        {tool('Numbered list', <ListOrdered />, 'insertOrderedList')}
        <Popover
          open={linkOpen}
          onOpenChange={(open) => {
            if (open) rememberSelection()
            setLinkOpen(open)
          }}
        >
          <PopoverTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Insert link" disabled={disabled}>
              <Link2 />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-2 p-3">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Link address
              <Input
                aria-label="Link address"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    applyLink()
                  }
                }}
              />
            </label>
            <Button type="button" size="sm" className="w-full" disabled={!SAFE_URL.test(url.trim())} onClick={applyLink}>
              Add link
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-label="Email body"
        aria-multiline="true"
        tabIndex={disabled ? -1 : 0}
        data-placeholder="Write your email"
        contentEditable={!disabled}
        suppressContentEditableWarning
        className="min-h-28 max-h-64 overflow-y-auto px-3 py-2 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
