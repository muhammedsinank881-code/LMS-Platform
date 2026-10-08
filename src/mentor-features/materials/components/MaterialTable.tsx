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

interface MaterialTableProps {
  materials: LearningMaterial[]
  onViewDetails: (material: LearningMaterial) => void
  onToggleStatus: (id: string) => void
  onDelete: (material: LearningMaterial) => void
}

export function MaterialTable({
  materials,
  onViewDetails,
  onToggleStatus,
  onDelete,
}: MaterialTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, url?: string) => {
    if (url) {
      navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <Card className="overflow-hidden border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4">Course & Module</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm font-medium">
            {materials.map((m) => {
              const isPdf = m.type === 'pdf'
              const isPublished = m.status === 'published'

              return (
                <tr
                  key={m.id}
                  className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(m)}
                >
                  {/* Material Title & Type Icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isPdf
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                        }`}
                      >
                        {isPdf ? <FileText className="size-4" /> : <PlayCircle className="size-4" />}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {m.title}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {isPdf ? `PDF · ${m.fileSize || 'Doc'}` : `Video · ${m.duration || 'Class'}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Course & Module */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground text-xs">{m.courseClass}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.module}</div>
                  </td>

                  {/* Topic */}
                  <td className="py-3 px-4 text-xs font-medium text-foreground">
                    {m.topic || '—'}
                  </td>

                  {/* Uploaded */}
                  <td className="py-3 px-4">
                    <div className="text-xs font-semibold text-foreground">{m.uploadedDate}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{m.uploadedBy}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Badge
                      tone={isPublished ? 'success' : 'neutral'}
                      appearance="soft"
                      dot
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onToggleStatus(m.id)}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId((prev) => (prev === m.id ? null : m.id))}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {activeMenuId === m.id ? (
                        <div
                          onMouseLeave={() => setActiveMenuId(null)}
                          className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-md shadow-lg py-1 z-30 space-y-0.5 text-xs font-semibold text-foreground text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onViewDetails(m)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>{isPdf ? 'View Details' : 'Watch Video'}</span>
                          </button>

                          {!isPdf && m.videoUrl ? (
                            <button
                              type="button"
                              onClick={() => handleCopy(m.id, m.videoUrl)}
                              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                            >
                              <Copy className="size-3.5 text-info" />
                              <span>{copiedId === m.id ? 'URL Copied!' : 'Copy URL'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                onViewDetails(m)
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
                              setActiveMenuId(null)
                              onToggleStatus(m.id)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2"
                          >
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                            <span>Make {isPublished ? 'Draft' : 'Published'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onDelete(m)
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-destructive/10 text-destructive flex items-center gap-2 border-t border-border/50"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
