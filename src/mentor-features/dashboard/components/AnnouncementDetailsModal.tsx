import { useState } from 'react'
import {
  Calendar,
  Check,
  Download,
  FileText,
  Megaphone,
  Pin,
  Share2,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  toast,
} from '@/components/ui'
import type { AnnouncementItem } from '../types'

interface AnnouncementDetailsModalProps {
  announcement: AnnouncementItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (announcement: AnnouncementItem) => void
  onDelete?: (announcement: AnnouncementItem) => void
}

export function AnnouncementDetailsModal({
  announcement,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: AnnouncementDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  if (!announcement) return null

  const handleCopyLink = () => {
    const url = `${window.location.origin}/mentor/announcements?id=${announcement.id}`
    void navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Announcement link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const getCategoryTone = (cat?: string): 'info' | 'primary' | 'warning' | 'neutral' => {
    if (!cat) return 'neutral'
    const lower = cat.toLowerCase()
    if (lower.includes('academic') || lower.includes('exam')) return 'primary'
    if (lower.includes('project') || lower.includes('evaluation')) return 'warning'
    return 'info'
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="rounded-xl border-border">
        <ModalHeader className="pb-3 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 pr-6">
            {announcement.category ? (
              <Badge tone={getCategoryTone(announcement.category)} appearance="soft" size="sm">
                {announcement.category}
              </Badge>
            ) : null}

            {announcement.isPinned ? (
              <Badge tone="warning" appearance="solid" size="sm" className="gap-1">
                <Pin className="size-3 fill-current" />
                <span>Pinned</span>
              </Badge>
            ) : null}
          </div>

          <ModalTitle className="text-xl font-bold text-foreground mt-2 leading-snug">
            {announcement.title}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 py-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-muted/40 p-3 rounded-lg border border-border">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> Published Date
              </span>
              <p className="font-semibold text-foreground">{announcement.date}</p>
            </div>

            {announcement.author ? (
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Megaphone className="size-3 text-primary" /> Published By
                </span>
                <p className="font-semibold text-foreground truncate">{announcement.author}</p>
              </div>
            ) : null}

            {announcement.targetAudience ? (
              <div className="space-y-0.5 sm:col-span-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Users className="size-3 text-primary" /> Target Audience
                </span>
                <p className="font-semibold text-foreground truncate">{announcement.targetAudience}</p>
              </div>
            ) : null}
          </div>

          {/* Main Content */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notice Details
            </h4>
            <div className="text-sm text-foreground bg-surface p-4 rounded-lg border border-border leading-relaxed whitespace-pre-wrap">
              {announcement.content ||
                'No additional details provided. Please contact the administration or academic coordinator for further guidance regarding this announcement.'}
            </div>
          </div>

          {/* Attached Files & Links */}
          {announcement.attachments && announcement.attachments.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Attached Files & Circulars ({announcement.attachments.length})
              </h4>
              <div className="space-y-1.5">
                {announcement.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between gap-3 text-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-md bg-primary-subtle text-primary shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{att.name}</p>
                        {att.size ? (
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {att.size}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <a
                      href={att.url}
                      onClick={(e) => {
                        e.preventDefault()
                        toast.success(`Downloading ${att.name}`)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-foreground hover:bg-primary hover:text-primary-foreground font-medium transition-colors shrink-0 cursor-pointer"
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="border-t border-border gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 mr-1.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 mr-1.5" />
                <span>Share Link</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(announcement)
                }}
                className="cursor-pointer"
              >
                Edit
              </Button>
            ) : null}

            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(announcement)
                }}
                className="cursor-pointer"
              >
                Delete
              </Button>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
