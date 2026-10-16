import { useState } from 'react'
import { ChevronDown, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import { Card, ProgressBar, Badge } from '@/components/ui'
import { TopicStatusList } from './TopicStatusList'
import type { SyllabusModule, TopicStatus } from '../types'

interface ModuleAccordionItemProps {
  module: SyllabusModule
  initiallyOpen?: boolean
  onStatusChange?: (topicId: string, nextStatus: TopicStatus) => void
  onOpenUpdateModal?: (moduleId: string) => void
}

export function ModuleAccordionItem({
  module,
  initiallyOpen = false,
  onStatusChange,
  onOpenUpdateModal,
}: ModuleAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)

  const totalTopics = module.topics.length
  const completedTopics = module.topics.filter((t) => t.status === 'completed').length
  const inProgressTopics = module.topics.filter((t) => t.status === 'in_progress').length

  const percentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const isModuleFullyCompleted = completedTopics === totalTopics && totalTopics > 0

  return (
    <Card className="bg-surface border-border shadow-2xs rounded-2xl overflow-hidden transition-all">
      {/* Header clickable row */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left p-3.5 sm:p-5 hover:bg-muted/30 transition-colors cursor-pointer select-none space-y-3"
        aria-expanded={isOpen}
      >
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isModuleFullyCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : inProgressTopics > 0
                  ? 'bg-primary-subtle text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {isModuleFullyCompleted ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : inProgressTopics > 0 ? (
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Module {module.moduleNumber}
                </span>
                {isModuleFullyCompleted ? (
                  <Badge tone="success" size="sm" className="text-[10px]">
                    Completed
                  </Badge>
                ) : inProgressTopics > 0 ? (
                  <Badge tone="primary" size="sm" className="text-[10px]">
                    In Progress
                  </Badge>
                ) : null}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5">
                {module.title}
              </h3>
            </div>
          </div>

          {/* Right side stats + Chevron */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-none">
                {percentage}%
              </div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {completedTopics} / {totalTopics} completed
              </div>
            </div>

            <div
              className={`h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-foreground' : ''
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Progress Bar for the Module */}
        <div className="w-full pt-1">
          <ProgressBar
            value={percentage}
            size="sm"
            tone={isModuleFullyCompleted ? 'success' : 'primary'}
            aria-label={`Module ${module.moduleNumber} Progress`}
          />
        </div>
      </button>

      {/* Expanded Topics List */}
      {isOpen && (
        <div className="border-t border-border bg-muted/10">
          {module.description ? (
            <div className="px-4 py-2.5 text-xs text-muted-foreground bg-muted/30 border-b border-border/50">
              {module.description}
            </div>
          ) : null}

          <TopicStatusList topics={module.topics} onStatusChange={onStatusChange} />

          {onOpenUpdateModal ? (
            <div className="p-3 bg-muted/30 border-t border-border/50 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenUpdateModal(module.id)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Update Module Topics →
              </button>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}
