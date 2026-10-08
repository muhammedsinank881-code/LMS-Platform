import { useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  PlayCircle,
  Trash2,
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
} from '@/components/ui'
import type { LearningMaterial } from '../types'

interface MaterialDetailsModalProps {
  material: LearningMaterial | null
  onClose: () => void
  onToggleStatus: (id: string) => void
  onDelete: (material: LearningMaterial) => void
}

export function MaterialDetailsModal({
  material,
  onClose,
  onToggleStatus,
  onDelete,
}: MaterialDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  if (!material) return null

  const isPdf = material.type === 'pdf'
  const isPublished = material.status === 'published'

  const handleCopyUrl = () => {
    if (material.videoUrl) {
      navigator.clipboard.writeText(material.videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Modal open={Boolean(material)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" className="rounded-lg border-border">
        <ModalHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2">
              <Badge tone={isPublished ? 'success' : 'neutral'} appearance="soft" dot size="sm">
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                {material.type} Material
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(material.id)}
            >
              Change to {isPublished ? 'Draft' : 'Published'}
            </Button>
          </div>

          <ModalTitle className="text-xl font-bold text-foreground mt-2">
            {material.title}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-5 py-4 max-h-[75vh] overflow-y-auto">
          {/* Media Preview Banner */}
          {isPdf ? (
            <div className="p-6 rounded-lg bg-primary-subtle/50 border border-primary/20 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary-subtle text-primary">
                <FileText className="size-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{material.fileName || material.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {material.fileSize || 'PDF Document'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/60 border border-border space-y-3">
              {material.videoUrl && material.videoUrl.includes('youtube.com') ? (
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black flex items-center justify-center">
                  <iframe
                    className="w-full h-full"
                    src={material.videoUrl.replace('watch?v=', 'embed/')}
                    title={material.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-md bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <PlayCircle className="size-12 text-primary" />
                  <p className="text-xs font-semibold">{material.title}</p>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {material.videoSource === 'url' ? material.videoUrl : material.fileName}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {material.description ? (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </h4>
              <p className="text-sm text-foreground bg-surface p-3 rounded-md border border-border leading-relaxed">
                {material.description}
              </p>
            </div>
          ) : null}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-surface border border-border space-y-2">
              <div className="flex justify-between py-0.5 border-b border-border/60">
                <span className="text-muted-foreground">Course / Class:</span>
                <span className="font-semibold text-foreground">{material.courseClass}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/60">
                <span className="text-muted-foreground">Semester:</span>
                <span className="font-semibold text-foreground">{material.semester}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Module:</span>
                <span className="font-semibold text-foreground">{material.module}</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-surface border border-border space-y-2">
              <div className="flex justify-between py-0.5 border-b border-border/60">
                <span className="text-muted-foreground">Topic:</span>
                <span className="font-semibold text-foreground">{material.topic || 'General'}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-border/60">
                <span className="text-muted-foreground">Uploaded Date:</span>
                <span className="font-semibold text-foreground">{material.uploadedDate}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Uploaded By:</span>
                <span className="font-semibold text-foreground">{material.uploadedBy}</span>
              </div>
            </div>
          </div>

          {/* Visibility Explanation */}
          <div className="p-3 rounded-md bg-muted/40 border border-border flex items-center gap-2.5 text-xs">
            <CheckCircle2 className={`size-4 shrink-0 ${isPublished ? 'text-success' : 'text-muted-foreground'}`} />
            <p className="text-muted-foreground">
              {isPublished
                ? 'Students can access and download this material from their portal.'
                : 'Only mentors can see this material. It is hidden from students.'}
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-border gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onClose()
              onDelete(material)
            }}
          >
            <Trash2 className="size-4 mr-1.5" />
            <span>Delete</span>
          </Button>

          {!isPdf && material.videoUrl ? (
            <Button type="button" variant="outline" onClick={handleCopyUrl}>
              <Copy className="size-4 mr-1.5" />
              <span>{copied ? 'Copied URL!' : 'Copy Video URL'}</span>
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onClose}>
              <Download className="size-4 mr-1.5" />
              <span>Download File</span>
            </Button>
          )}

          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
