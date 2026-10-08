import {
  Calendar,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  MapPin,
  RefreshCw,
  Trash2,
  Users,
  Video,
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
import type { ScheduledClass } from '../types'

interface ClassDetailsModalProps {
  cls: ScheduledClass | null
  onClose: () => void
  onEdit: (c: ScheduledClass) => void
  onReschedule: (c: ScheduledClass) => void
  onCancel: (c: ScheduledClass) => void
}

export function ClassDetailsModal({
  cls,
  onClose,
  onEdit,
  onReschedule,
  onCancel,
}: ClassDetailsModalProps) {
  if (!cls) return null

  const isOngoing = cls.status === 'ongoing'
  const isOnline = cls.type === 'online'
  const isCancelled = cls.status === 'cancelled'

  return (
    <Modal open={Boolean(cls)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" className="rounded-lg border-border">
        <ModalHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  isOngoing
                    ? 'success'
                    : isCancelled
                      ? 'destructive'
                      : cls.status === 'completed'
                        ? 'neutral'
                        : 'primary'
                }
                appearance="soft"
                dot={isOngoing}
                size="sm"
              >
                {cls.status}
              </Badge>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                {cls.type} Session
              </span>
            </div>
          </div>

          <ModalTitle className="text-xl font-bold text-foreground mt-2">
            {cls.title}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 py-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Details Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/40 p-3 rounded-lg border border-border">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> Date
              </span>
              <p className="font-bold text-foreground">{cls.date}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="size-3 text-primary" /> Timing
              </span>
              <p className="font-bold text-foreground">{cls.startTime} - {cls.endTime}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                {isOnline ? <Video className="size-3 text-primary" /> : <MapPin className="size-3 text-primary" />} Location
              </span>
              <p className="font-bold text-foreground truncate">{isOnline ? cls.meetingPlatform : cls.room}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Users className="size-3 text-primary" /> Capacity
              </span>
              <p className="font-bold text-foreground">{cls.capacity} Students</p>
            </div>
          </div>

          {/* Online Meeting Link if available */}
          {isOnline && cls.meetingLink ? (
            <div className="p-3 rounded-md bg-primary-subtle border border-primary/20 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-bold text-primary block">Online Meeting Link:</span>
                <span className="text-primary/90 font-mono truncate block">{cls.meetingLink}</span>
              </div>
              <a
                href={cls.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold flex items-center gap-1 shrink-0 hover:bg-primary/90 transition-colors"
              >
                <span>Join</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          ) : null}

          {/* Course Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3 rounded-md bg-surface border border-border">
            <div>
              <span className="text-muted-foreground block">Course / Class:</span>
              <span className="font-bold text-foreground">{cls.courseClass}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Semester:</span>
              <span className="font-bold text-foreground">{cls.semester}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Module:</span>
              <span className="font-bold text-foreground">{cls.module}</span>
            </div>
          </div>

          {/* Description */}
          {cls.description ? (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description & Agenda
              </h4>
              <p className="text-xs text-foreground bg-surface p-3 rounded-md border border-border leading-relaxed">
                {cls.description}
              </p>
            </div>
          ) : null}

          {/* Attached Materials */}
          {cls.attachedMaterialTitles && cls.attachedMaterialTitles.length > 0 ? (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Attached Learning Materials
              </h4>
              <div className="space-y-1">
                {cls.attachedMaterialTitles.map((title, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-muted/40 border border-border text-xs flex items-center gap-2 font-medium text-foreground"
                  >
                    <FileText className="size-3.5 text-primary shrink-0" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="border-t border-border gap-2">
          {!isCancelled ? (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onClose()
                  onCancel(cls)
                }}
              >
                <Trash2 className="size-4 mr-1.5" />
                <span>Cancel Class</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose()
                  onReschedule(cls)
                }}
              >
                <RefreshCw className="size-4 mr-1.5" />
                <span>Reschedule</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onClose()
                  onEdit(cls)
                }}
              >
                <Edit3 className="size-4 mr-1.5" />
                <span>Edit Class</span>
              </Button>
            </>
          ) : (
            <Button type="button" variant="primary" onClick={onClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
