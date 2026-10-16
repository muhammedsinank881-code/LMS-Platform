import { useState, useEffect } from 'react'
import { Check, Clock, Circle, CheckCircle2 } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Button,
} from '@/components/ui'
import type { SyllabusModule, TopicStatus } from '../types'

interface UpdateProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modules: SyllabusModule[]
  initialModuleId?: string
  className: string
  onSave: (moduleId: string, updates: { topicId: string; status: TopicStatus }[]) => void
}

export function UpdateProgressModal({
  open,
  onOpenChange,
  modules,
  initialModuleId,
  className,
  onSave,
}: UpdateProgressModalProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    initialModuleId || modules[0]?.id || '',
  )

  useEffect(() => {
    if (initialModuleId) {
      setSelectedModuleId(initialModuleId)
    } else if (modules[0]?.id && !selectedModuleId) {
      setSelectedModuleId(modules[0].id)
    }
  }, [initialModuleId, modules, selectedModuleId])

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0]

  // Local draft topic statuses for the active module
  const [draftStatuses, setDraftStatuses] = useState<Record<string, TopicStatus>>({})

  useEffect(() => {
    if (activeModule) {
      const initialMap: Record<string, TopicStatus> = {}
      activeModule.topics.forEach((t) => {
        initialMap[t.id] = t.status
      })
      setDraftStatuses(initialMap)
    }
  }, [activeModule])

  const handleStatusChange = (topicId: string, status: TopicStatus) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [topicId]: status,
    }))
  }

  const handleMarkAll = (status: TopicStatus) => {
    if (!activeModule) return
    const updated: Record<string, TopicStatus> = {}
    activeModule.topics.forEach((t) => {
      updated[t.id] = status
    })
    setDraftStatuses(updated)
  }

  const handleSave = () => {
    if (!activeModule) return
    const updates = Object.entries(draftStatuses).map(([topicId, status]) => ({
      topicId,
      status,
    }))
    onSave(activeModule.id, updates)
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className="max-h-[90vh] flex flex-col">
        <ModalHeader>
          <ModalTitle>Update Syllabus Progress</ModalTitle>
          <ModalDescription>
            Update topic completion status for <strong className="text-foreground">{className}</strong>.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4 flex-1 overflow-y-auto">
          {/* Module Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Select Module
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {modules.map((mod) => {
                const isSelected = mod.id === selectedModuleId
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    Module {mod.moduleNumber}
                  </button>
                )
              })}
            </div>
            {activeModule ? (
              <p className="text-xs text-muted-foreground font-medium pt-0.5">
                {activeModule.title}
              </p>
            ) : null}
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
            <span className="font-semibold text-muted-foreground">Quick Actions:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('completed')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Mark All Completed
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleMarkAll('in_progress')}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Mark All In Progress
              </button>
            </div>
          </div>

          {/* Topics List with Status Selectors */}
          <div className="space-y-2 border border-border rounded-xl p-2 bg-muted/20 divide-y divide-border/60">
            {activeModule?.topics.map((topic, idx) => {
              const currentStatus = draftStatuses[topic.id] || topic.status

              return (
                <div
                  key={topic.id}
                  className="pt-2 pb-2 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="text-xs font-medium text-foreground min-w-0 pr-2">
                    <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                    {topic.title}
                  </div>

                  {/* 3-Way Status Toggle */}
                  <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(topic.id, 'not_started')}
                      className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        currentStatus === 'not_started'
                          ? 'bg-muted text-foreground font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Circle className="h-3 w-3" />
                      <span>Not Started</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(topic.id, 'in_progress')}
                      className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        currentStatus === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>In Progress</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(topic.id, 'completed')}
                      className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        currentStatus === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Completed</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="cursor-pointer font-semibold"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            <span>Save Progress</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
