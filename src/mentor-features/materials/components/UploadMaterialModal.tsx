import { useState } from 'react'
import { FileText, Video } from 'lucide-react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui'
import type { LearningMaterial, MaterialType } from '../types'
import { PdfUploadForm } from './PdfUploadForm'
import { VideoUploadForm } from './VideoUploadForm'

interface UploadMaterialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableCourses: string[]
  availableModules: string[]
  onSubmit: (material: Omit<LearningMaterial, 'id' | 'uploadedDate' | 'uploadedBy'>) => void
}

export function UploadMaterialModal({
  open,
  onOpenChange,
  availableCourses,
  availableModules,
  onSubmit,
}: UploadMaterialModalProps) {
  const [selectedType, setSelectedType] = useState<MaterialType>('pdf')

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="rounded-lg border-border">
        <ModalHeader className="pb-3">
          <ModalTitle className="text-lg font-bold text-foreground">
            Upload Learning Material
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 pb-6">
          {/* Material Type Selection Cards */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Material Type *</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('pdf')}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-center gap-3 cursor-pointer select-none ${
                  selectedType === 'pdf'
                    ? 'bg-primary-subtle border-primary text-primary shadow-2xs'
                    : 'bg-surface border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    selectedType === 'pdf' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">PDF / Notes</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Documents & PDFs</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('video')}
                className={`p-3.5 rounded-lg border text-left transition-all flex items-center gap-3 cursor-pointer select-none ${
                  selectedType === 'video'
                    ? 'bg-primary-subtle border-primary text-primary shadow-2xs'
                    : 'bg-surface border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    selectedType === 'video' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <Video className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Video Class</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Video file or URL</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Render */}
          {selectedType === 'pdf' ? (
            <PdfUploadForm
              availableCourses={availableCourses}
              availableModules={availableModules}
              onCancel={() => onOpenChange(false)}
              onSubmit={onSubmit}
            />
          ) : (
            <VideoUploadForm
              availableCourses={availableCourses}
              availableModules={availableModules}
              onCancel={() => onOpenChange(false)}
              onSubmit={onSubmit}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
