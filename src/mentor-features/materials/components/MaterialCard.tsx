import { useState } from 'react'
import {
  Copy,
  Download,
  Eye,
  FileText,
  MoreVertical,
  PlayCircle,
  Trash2,
} from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { LearningMaterial } from '../types'

interface MaterialCardProps {
  material: LearningMaterial
  onViewDetails: (material: LearningMaterial) => void
  onToggleStatus: (id: string) => void
  onDelete: (material: LearningMaterial) => void
}

export function MaterialCard({
  material,
  onViewDetails,
  onToggleStatus,
  onDelete,
}: MaterialCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const isPdf = material.type === 'pdf'
  const isPublished = material.status === 'published'

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (material.videoUrl) {
      navigator.clipboard.writeText(material.videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="p-4 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all shadow-2xs group relative">
      {/* Header: Type icon, Title, Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
              isPdf
                ? 'bg-primary-subtle text-primary'
                : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
            }`}
          >
            {isPdf ? <FileText className="size-5" /> : <PlayCircle className="size-5" />}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h3
              onClick={() => onViewDetails(material)}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-2"
            >
              {material.title}
            </h3>
            <p className="text-xs text-muted-foreground font-medium truncate">
              {material.courseClass} · <span className="text-foreground/80">{material.module}</span>
            </p>
          </div>
        </div>

        <Badge
          tone={isPublished ? 'success' : 'neutral'}
          appearance="soft"
          dot
          size="sm"
          className="shrink-0"
        >
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      </div>

      {/* Description / Topic if present */}
      {material.topic ? (
        <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50 flex items-center justify-between">
          <span className="font-semibold text-foreground truncate">Topic: {material.topic}</span>
          {material.duration ? <span className="shrink-0 font-medium">{material.duration}</span> : null}
        </div>
      ) : null}

      {/* Info Line */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="uppercase font-bold text-foreground">{material.type}</span>
          <span>·</span>
          <span>{isPdf ? material.fileSize || 'PDF' : material.duration || 'Video'}</span>
          <span>·</span>
          <span>Uploaded {material.uploadedDate}</span>
        </div>

        {/* Action Menu Toggle / Actions */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Material Options"
          >
            <MoreVertical className="size-4" />
          </button>

          {showMenu ? (
            <div
              onMouseLeave={() => setShowMenu(false)}
              className="absolute right-0 bottom-full mb-1 w-44 bg-surface border border-border rounded-md shadow-lg py-1 z-30 space-y-0.5 text-xs font-semibold text-foreground"
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  onViewDetails(material)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
              >
                <Eye className="size-3.5 text-primary" />
                <span>{isPdf ? 'View Details' : 'Watch Video'}</span>
              </button>

              {!isPdf && material.videoUrl ? (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                >
                  <Copy className="size-3.5 text-info" />
                  <span>{copied ? 'URL Copied!' : 'Copy URL'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false)
                    onViewDetails(material)
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                >
                  <Download className="size-3.5 text-info" />
                  <span>Download PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  onToggleStatus(material.id)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
              >
                <span className="size-2 rounded-full bg-primary shrink-0" />
                <span>Make {isPublished ? 'Draft' : 'Published'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  onDelete(material)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-destructive/10 text-destructive flex items-center gap-2 border-t border-border/50"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
