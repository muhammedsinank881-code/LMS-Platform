import { CheckCircle2, Clock, Circle } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { SyllabusTopic, TopicStatus } from '../types'

interface TopicStatusListProps {
  topics: SyllabusTopic[]
  onStatusChange?: (topicId: string, nextStatus: TopicStatus) => void
}

export function TopicStatusList({ topics, onStatusChange }: TopicStatusListProps) {
  const getStatusIcon = (status: TopicStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
      case 'not_started':
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
    }
  }

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge tone="success" size="sm" className="text-[10px] py-0 px-2 font-semibold">
            Completed
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge tone="warning" size="sm" className="text-[10px] py-0 px-2 font-semibold">
            In Progress
          </Badge>
        )
      case 'not_started':
      default:
        return (
          <Badge tone="neutral" size="sm" className="text-[10px] py-0 px-2 font-semibold text-muted-foreground">
            Not Started
          </Badge>
        )
    }
  }

  const getNextStatus = (current: TopicStatus): TopicStatus => {
    if (current === 'not_started') return 'in_progress'
    if (current === 'in_progress') return 'completed'
    return 'not_started'
  }

  return (
    <div className="divide-y divide-border/60">
      {topics.map((topic, idx) => (
        <div
          key={topic.id}
          className="flex items-center justify-between py-2.5 px-3 sm:px-4 hover:bg-muted/40 transition-colors gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {getStatusIcon(topic.status)}
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              <span className="text-muted-foreground text-[11px] mr-1.5">{idx + 1}.</span>
              {topic.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onStatusChange ? (
              <button
                type="button"
                onClick={() => onStatusChange(topic.id, getNextStatus(topic.status))}
                title="Click to cycle status: Not Started → In Progress → Completed"
                className="cursor-pointer transition-transform active:scale-95"
              >
                {getStatusBadge(topic.status)}
              </button>
            ) : (
              getStatusBadge(topic.status)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
