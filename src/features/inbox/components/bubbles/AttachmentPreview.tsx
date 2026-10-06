import { FileText, ImageIcon, Mic } from 'lucide-react'
import { cn } from '@/lib/cn'
import { extensionOf, formatFileSize } from '@/lib/inbox/attachment-rules'
import type { MessageAttachment } from '@/types'

const REAL_URL = /^(https?:|data:image\/)/

/** Mock uploads have no real file, so images render as a labelled placeholder tile. */
function ImageTile({ file }: { file: MessageAttachment }) {
  if (file.url && REAL_URL.test(file.url)) {
    return <img src={file.url} alt={file.name} className="max-h-60 w-full rounded-md object-cover" />
  }
  return (
    <div
      role="img"
      aria-label={`Image: ${file.name}`}
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-md bg-gradient-to-br from-muted to-border text-muted-foreground"
    >
      <ImageIcon className="h-8 w-8" aria-hidden="true" />
      <span className="max-w-full truncate px-2 text-xs">{file.name}</span>
    </div>
  )
}

export function AttachmentPreview({ file, className }: { file: MessageAttachment; className?: string }) {
  if (file.kind === 'image') {
    return (
      <figure className={cn('w-60 max-w-full', className)}>
        <ImageTile file={file} />
        <figcaption className="mt-1 text-xs text-muted-foreground">{formatFileSize(file.sizeKb)}</figcaption>
      </figure>
    )
  }
  const Icon = file.kind === 'audio' ? Mic : FileText
  const kindLabel = file.kind === 'audio' ? 'Voice message' : extensionOf(file.name).toUpperCase() || 'File'
  return (
    <div className={cn('flex w-64 max-w-full items-center gap-3 rounded-md border border-border bg-surface/80 p-2', className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {kindLabel} · {formatFileSize(file.sizeKb)}
        </p>
      </div>
    </div>
  )
}
