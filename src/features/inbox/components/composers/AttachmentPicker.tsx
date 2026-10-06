import { Paperclip, X } from 'lucide-react'
import { Button, toast, Tooltip } from '@/components/ui'
import { formatFileSize, toMockAttachment, validateAttachment } from '@/lib/inbox/attachment-rules'
import type { MessageAttachment } from '@/types'

/**
 * Mock uploader: validates type and size like the real one would, then keeps only metadata.
 * `buttonOnly` renders just the paperclip; `listOnly` renders just the chosen files.
 */
export function AttachmentPicker({
  files,
  onChange,
  buttonOnly = false,
  listOnly = false,
}: {
  files: MessageAttachment[]
  onChange: (files: MessageAttachment[]) => void
  buttonOnly?: boolean
  listOnly?: boolean
}) {
  const pick = (file: File | undefined) => {
    if (!file) return
    const sizeKb = Math.max(1, Math.round(file.size / 1024))
    const error = validateAttachment({ name: file.name, sizeKb })
    if (error) {
      toast.error(error)
      return
    }
    if (files.some((item) => item.name === file.name)) {
      toast.error('That file is already attached.')
      return
    }
    onChange([...files, toMockAttachment({ name: file.name, sizeKb })])
  }

  return (
    <>
      {listOnly ? null : (
        <Tooltip content="Attach a file: images up to 5 MB, documents and audio up to 16 MB">
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Attach file" asChild>
            <label className="cursor-pointer">
              <Paperclip />
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  pick(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </label>
          </Button>
        </Tooltip>
      )}
      {buttonOnly || files.length === 0 ? null : (
        <ul className="flex flex-wrap gap-2" aria-label="Attachments">
          {files.map((file) => (
            <li
              key={file.name}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-xs"
            >
              <span className="truncate font-medium">{file.name}</span>
              <span className="text-muted-foreground">{formatFileSize(file.sizeKb)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onChange(files.filter((item) => item.name !== file.name))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
